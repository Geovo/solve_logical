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
    split_formula(f) {
        var regex = /\s*([∧∨¬⊕≡→\(\)]|[A-Za-z_][A-Za-z0-9_]*|[0-9]*\.?[0-9]+)\s*/g;
        return f.split(regex).filter(function (s) { return !s.match(/^\s*$/); });
    }

    evaluate() {
        let result;
        for (let node in nodes) {

        }
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

    list_table() {

        for (var i = 0; i < this.table.length; i++) {
            var num = this.table[i];
            //var line = "|";
            /*for (var  in num) {
                line += " " + d + " |";
            }*/
            //console.log(line);
            console.log(num);
        }
    }
}

var t = new TruthTable(["a", "b", "c"]);
t.list_table();

export let v = new Formula();
