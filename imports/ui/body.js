import { Template } from 'meteor/templating';
import { Formulas } from '../api/vars.js';

//import '../api/logical_function.js';

import './formula.js';
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
    this.curr_formula = "";
});

Template.body.helpers({
  current() {
      //const instance = Template.instance();
      //return instance.formula;
      return Formulas.find({}, { sort: {createdAt: -1 }});
  },
  row() {

  },
  current_form() {
      return this.curr_formula;
  }
});

Template.body.events({
    'submit .new-add'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        Formulas.insert({
          text,
          createdAt: new Date(), // current time
        });

        this.curr_formula = text;

        // clear current table:
        document.getElementById("table-holder").innerHTML = "";
        v.add_formula(text);
        let table = v.evaluate();
        // make it appear on website
        document.getElementById("table-holder").innerHTML = "";
        console.log("table: " + table);
        document.getElementById("table-holder").innerHTML = table;
        //document.getElementById("current_active").innerHTML = text;
        // Clear form
        target.text.value = '';
        document.getElementById("filler").value = "";
    },
    'click .func-button'(event) {
        event.preventDefault();
        // Get value from button element
        const target = event.target;
        const text = target.innerHTML;
        // put the right value into the input
        document.getElementById("filler").value += " " + text + " ";
    },
    'click .activate'(event) {
        event.preventDefault();
        // fill form with value
        const target = event.target.parentNode;
        const text = target.getElementsByClassName("formula-val")[0].innerHTML;
        document.getElementById("filler").value = text;
    },

});

// global functions:
function precedence(x) {
    switch (x) {
        case "¬":
            return 1;
        case "∧":
            return 2;
        case "∨":
            return 3;
        case "→":
            return 4;
        case "≡":
            return 5;
        case "⊕":
            return 6;

        default:
            return 0;
    }
}

class Formula {
    constructor() {
        this.nodes = [];
        this.variables = [];
    }

    add(input) {
        this.nodes.push(input);
        // check for variables
        if (input.match(identifier)) {
            if (!this.variables.include(input)) {
                this.variables.push(input);
            }
        }
    }
    add_formula(f) {
        this.formula = f;
    }
//¬(a ∧ ¬b) ∨ (¬c ⊕ d) -> a ¬b ∧ ¬ ¬c d ^

    execute(a, b, op) {
        a = Number(a);
        b = Number(b);
        if (op == "∨") {
            return a | b;
        } else if (op == "→") {
            return a | b;
        } else if (op == "∧") {
            return a & b;
        } else if (op == "⊕") {
            return a ^ b;
        } else if (op == "≡") {
            return a;
        } else if (op == "¬") {
            return !a;
        }
        return 0;
    }

    rpn(input) {
        // split the input
        var id = /[a-zA-Z0-9]+/,
            op = /[∧∨⊕≡→¬]/,
            sign = /[¬]/,
            openBracket = /\(/,
            closeBracket = /\)/,
            ary = input.split(/\s*([a-zA-Z0-9_]+|∧|∨|⊕|≡|→|¬)\s*/),
            stack = [],
            out = [],
            sign = "",
            prev = "", // needed for deciding whether operator or sign
            variables = [];

        for (var i = 0; i < ary.length; i++) {
            if (ary[i] !== "") {
                if (ary[i].match(id)) {
                    out.push(sign + ary[i]);
                    if (!variables.includes(ary[i]))
                        variables.push(ary[i]);
                    sign = ""; // set to empty
                } else if (ary[i].match(op)) {
                    var prec = precedence(ary[i]);
                    //console.log("precedence: " + prec);
                    // decide whether operator or sign
                    if (ary[i].match(sign) && prev.match(op)) {
                        // assign to next number
                        sign = ary[i];
                    } else {
                        while (stack.length > 0 && prec <= precedence(stack[stack.length-1])) {
                            out.push(stack.pop());
                        }
                        stack.push(ary[i]);
                    }
                } else if (ary[i].match(openBracket)) {
                    stack.push(ary[i]);
                } else if (ary[i].match(closeBracket)) {
                    for (;stack.length > 0 && stack[stack.length-1] !== "("; out.push(stack.pop())) {}
                    stack.pop(); // remove the left bracket
                }
                // save previous operator
                prev = ary[i].match(/[\(\)]/) ? prev : ary[i];
            }
        }
        // pop out what's left in the stack
        for (var i = 0; i < stack.length; i++)
            out.push(stack.pop());

        // set this.variables
        this.variables = variables;
        return {
            rpn: out,
            variables: variables
        };
    }


    evaluate() {
        let result;
        let parsed = this.rpn(this.formula);
        let rpn = parsed.rpn;
        let f = this.formula;

        // now our rpn works just fine
        // we also have all the variables we need, so let's create a table
        var t = new TruthTable(this.variables);
        let out = "<table border='1' style='width:100%; text-align: center'><tr>";
        // first, add the legend above:
        for (var i = 0; i < this.variables.length; i++) {
            out += "<th>" + this.variables[i] + "</th>";
        }
        out += "<th>Expression: " + this.formula + "</th></tr>";

        // goes the loop
        for (let j = 0; j < t.table.length; j++) {
            // start loop for each row
            let rpn_new = [];
            // copy array
            for (let x = 0; x < rpn.length; x++) {
                rpn_new.push(rpn[x]);
            }

            out += "<tr>";
            for (let i = 0; i < t.table[j].length; i++) {
                out += "<td>" + t.table[j][i] + "</td>";
            }
            // now we should evaluate the function
            let res;
            var values = {};
            for (let i = 0; i < this.variables.length; i++) {
                values[this.variables[i]] = t.table[j][i];
            }

            // now replace the variable names in rpn with their values
            for (let i = 0; i < rpn_new.length; i++) {
                if (rpn_new[i].match(/¬[a-zA-Z]+/g)) {
                    let s = rpn_new[i].substr(1, rpn_new[i].length-1);
                    rpn_new[i] = String((Number(values[s]) + 1) % 2);
                } else if (rpn_new[i].match(/[a-zA-Z]+/g)) {
                    rpn_new[i] = String(values[rpn_new[i]]);
                }
            }
            // all operations need two operands, except negation
            var count = 0,
                reach = rpn_new.length;
            for (let i = 0; count < reach; i++, count++) {
                // skip undefined:
                if (rpn_new[i] == null)
                    continue;
                // special case -> negate
                if (rpn_new[i] == "¬") {
                    //rpn_new[i-1] = String(Number(rpn_new[i-1] + 1) % 2);
                    rpn_new.splice(i,2,String(Number(rpn_new[i-1] + 1) % 2));
                }
                console.log(rpn_new);
                if (rpn_new[i].match(/[∧∨⊕≡→]/)) {
                    // exec function and put back on list
                    let a = rpn_new[i-1];
                    let b = rpn_new[i-2];
                    let op = rpn_new[i];

                    i -= 2;
                    rpn_new.splice(i,1);
                    rpn_new.splice(i,1);
                    rpn_new.splice(i,1);
                    rpn_new.unshift(String(this.execute(b, a, op)));
                }
            }
            out += "<td>" + rpn_new[0] + "</td>" + "</tr>";
        }
        // close table
        out += "</table>";
        // clear variables
        this.variables = [];
        // return
        return out;
    }
}

/*
 * 123 -> []
 *  61 -> [1]
 *  30 -> [1,1]
 *  15 -> [1,1,0]
 *   7 -> [1,1,0,1]
 *   3 -> [1,1,0,1,1]
 *   1 -> [1,1,0,1,1,1]
 *   0 -> [1,1,0,1,1,1,1]
 * Reverse: [1,1,1,1,0,1,1]
 */

class BinNum {
    constructor(num) {
        this.decimal = num;
    }

    toBin(num) {
        var bin = [];
        num = num == undefined ? this.decimal : num;
        while (num > 0) {
            bin.push(num % 2);
            num = Math.floor(num / 2);
        }
        return bin.reverse()
    }
}

class BinaryTable {
    constructor(size) {
        this.size = Math.pow(2, size);
        this.ars = [];
        this.current = 0;
        var binum = new BinNum(2);
        for (var i = 0; i < this.size; i++) {
            var nu = binum.toBin(i);
            // prepend zero's:
            while (nu.length < size) {
                nu.unshift(0);
            }
            this.ars.push(nu);
        }
    }
}

class TruthTable {
    constructor(variables) {
        this.count = variables.length;
        this.table = new BinaryTable(this.count).ars;
    }

    update(variables) {
        this.count = variables.length;
        this.table = new BinaryTable(this.count).ars;
    }
}


// initialize formula object
let v = new Formula();
