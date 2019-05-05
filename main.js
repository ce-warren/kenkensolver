//// CONSTRUCT BOARD ////

document.getElementById('create').addEventListener('click', makeBoard);
let dimension;
let selected = [];
let boxes = [];

function makeBoard() {
    dimension = parseInt(document.getElementById('dim-input').value);
    if (isNaN(dimension)) {
        document.getElementById('input-error').classList.remove('invis');
        return;
    };
    document.getElementById('dimensions').classList.add('invis');
    document.getElementById('controls').classList.remove('invis');

    square_size = Math.floor((100 / dimension) * .75);
    board_div = document.getElementById('board-div');
    board = document.createElement('table');
    board.id = 'board';
    board_div.appendChild(board);
    for (let r = 0; r < dimension; r ++) {
        let row = document.createElement('tr');
        row.classList.add('row');
        board.appendChild(row);
        selected.push([])
        for (let c = 0; c < dimension; c ++) {
            let col = document.createElement('th');
            col.id = r.toString() + '-' + c.toString();
            col.addEventListener('click', function() {toggleSelect(col.id)});
            col.classList.add('square');
            col.style = 'height:' + square_size + 'vmin; width:' + square_size + 'vmin;'
            row.appendChild(col);
            selected[r].push(0);
        };
    };

    document.getElementById('add-box').addEventListener('click', addBox);
    document.getElementById('solve').addEventListener('click', function() {solve(false)});
    document.getElementById('hint').addEventListener('click', function() {solve(true)});
};

function toggleSelect(id) {
    square = document.getElementById(id);
    if (square.classList.contains('used')) {
        return;
    };
    if (square.classList.contains('selected')) {
        document.getElementById(id).classList.remove('selected');
        selected[id.split('-')[0]][id.split('-')[1]] = 0;
    }
    else {
        document.getElementById(id).classList.add('selected');
        selected[id.split('-')[0]][id.split('-')[1]] = 1;
    };
};

function toggleCover(id) {
    square = document.getElementById(id);
    if (square.classList.contains('covered')) {
        document.getElementById(id).classList.remove('covered');
        selected[id.split('-')[0]][id.split('-')[1]] = 0;
    }
    else {
        document.getElementById(id).classList.add('covered');
        selected[id.split('-')[0]][id.split('-')[1]] = 1;
    };
}

function addBox() {
    let valid = true;
    document.getElementById('solve-start-error').classList.add('invis');
    let temp = [];

    // validate selected squares
    for (let r = 0; r < dimension; r ++) {
        for (let c = 0; c < dimension; c ++) {
            if (selected[r][c] == 1) {
                temp.push([r, c]);
            };
        };
    };
    if (!checkValidBox(temp)) {
        document.getElementById('add-box-error').classList.remove('invis');
        valid = false;
    }
    else {
        document.getElementById('add-box-error').classList.add('invis');
    };

    // validate number
    num = parseInt(document.getElementById('number').value);
    if (isNaN(num)) {
        document.getElementById('box-num-error').classList.remove('invis');
        valid = false;
    }
    else {
        document.getElementById('box-num-error').classList.add('invis');
    };

    // validate operation
    let op = 'undefined';
    if (document.getElementById('operation-add').checked) {
        document.getElementById('box-op-error').classList.add('invis');
        op = '+';
    }
    else if (document.getElementById('operation-subtract').checked) {
        document.getElementById('box-op-error').classList.add('invis');
        op = '-';
    }
    else if (document.getElementById('operation-multiply').checked) {
        document.getElementById('box-op-error').classList.add('invis');
        op = 'x';
    }
    else if (document.getElementById('operation-divide').checked) {
        document.getElementById('box-op-error').classList.add('invis');
        op = '/';
    }
    else if (document.getElementById('operation-none').checked) {
        if (temp.length != 1) {
            document.getElementById('box-op-inval-error').classList.remove('invis');
            valid = false;
        }
        document.getElementById('box-op-error').classList.add('invis');
        op = ' ';
    }
    else {
        document.getElementById('box-op-error').classList.remove('invis');
        valid = false;
    };

    if (!valid) {
        return;
    };

    document.getElementById('number').value = '';
    document.getElementById('operation-add').checked = false;
    document.getElementById('operation-subtract').checked = false;
    document.getElementById('operation-multiply').checked = false;
    document.getElementById('operation-divide').checked = false;
    document.getElementById('operation-none').checked = false;

    // make box
    for (let t of temp) {
        square = document.getElementById(t[0].toString() + '-' + t[1].toString());
        square.classList.remove('selected');
        square.classList.add('used');
        if (t[0] == 0) {
            square.classList.add('square-top-border');
        }
        else if (selected[t[0]-1][t[1]] != 1) {
            square.classList.add('square-top-border');
        };
        if (t[1] == 0) {
            square.classList.add('square-left-border');
        }
        else if (selected[t[0]][t[1] - 1] != 1) {
            square.classList.add('square-left-border');
        };
        if (t[0] == dimension - 1) {
            square.classList.add('square-bottom-border');
        }
        else if (selected[t[0]+1][t[1]] != 1) {
            square.classList.add('square-bottom-border');
        };
        if (t[1] == dimension - 1) {
            square.classList.add('square-right-border');
        }
        else if (selected[t[0]][t[1] + 1] != 1) {
            square.classList.add('square-right-border');
        };
    };
    for (let t of temp) {
        selected[t[0]][t[1]] = 2;
    };
    box = new Box(temp, op, num);
    document.getElementById(box.title_square).innerHTML = num.toString() + op;
    boxes.push(box);
};

function checkValidBox(temp) {
    if (temp.length == 0) {
        return false;
    }
    if (temp.length == 1) {
        return true;
    }
    for (let t of temp) {
        let failed = 0;
        for (let u of temp) {
            if (t[0] == u[0] && t[1] == u[1] + 1) {
                continue;
            }
            else if (t[0] == u[0] && t[1] == u[1] - 1) {
                continue;
            }
            else if (t[0] == u[0] + 1 && t[1] == u[1]) {
                continue;
            }
            else if (t[0] == u[0] - 1 && t[1] == u[1]) {
                continue;
            }
            else {
                failed ++;
            };
        };
        if (failed == temp.length) {
            return false;
        };
    };
    return true;
};

class Box {
    constructor(sl, op, num) {
        this.square_list = sl;
        this.operation = op;
        this.number = num;
        this.title_square = this.square_list[0][0].toString() + '-' + this.square_list[0][1].toString();
    };
};

class Board {
    constructor(dim_) {
        this.dim = dim_;
        this.board = [];
        for (let i = 0; i < this.dim; i ++) {
            let row = [];
            for (let j = 0; j < this.dim; j ++) {
                row.push(0);
            };
            this.board.push(row);
        };
    };

    branch(box, vals) {
        let boards = []
        for (let i = 0; i < vals.length; i ++) {
            let b = new Board(dimension);
            for (let i = 0; i < this.dim; i ++) {
                for (let j = 0; j < this.dim; j ++) {
                    b.board[i][j] = this.board[i][j];
                };
            };
            for (let j = 0; j < vals[i].length; j ++){
                b.board[box.square_list[j][0]][box.square_list[j][1]] = vals[i][j];
            };
            boards.push(b);
        };
        console.log('branch return')
        console.log(boards)
        return boards;
    };

    checkValid() {
        for (let r = 0; r < this.dim; r ++) {
            let l = [];
            for (let c = 0; c < this.dim; c ++) {
                if (this.board[r][c] == 0) {
                    continue;
                }
                else if (l.includes(this.board[r][c])) {
                    return false;
                }
                else {
                    l.push(this.board[r][c]);
                };
            };
        };
        for (let c = 0; c < this.dim; c ++) {
            let l = [];
            for (let r = 0; r < this.dim; r ++) {
                if (this.board[r][c] == 0) {
                    continue;
                }
                else if (l.includes(this.board[r][c])) {
                    return false;
                }
                else {
                    l.push(this.board[r][c]);
                };
            };
        };
        return true;
    };
};

function solve(hint) {
    for (let r = 0; r < dimension; r ++) {
        for (let c = 0; c < dimension; c ++) {
            if (selected[r][c] != 2) {
                document.getElementById('solve-start-error').classList.remove('invis');
                return;
            };
        };
    };
    document.getElementById('solve-start-error').classList.add('invis');
    document.getElementById('controls').classList.add('invis');

    let boards = getBoard();
    if (boards.length == 0) {
        document.getElementById('cannot-solve-error').classList.remove('invis');
        return;
    };
    if (boards.length > 1) {
        document.getElementById('other').classList.remove('invis');
    };
    let board = boards[0];
    for (let i = 0; i < dimension; i ++) {
        for (let j = 0; j < dimension; j ++) {
            let elem = document.getElementById(i.toString() + '-' + j.toString());
            if (hint) {
                elem.classList.add('covered');
                elem.addEventListener('click', function() {toggleCover(elem.id)});
            };
            let number = document.createElement('p');
            number.classList.add('box-number');
            number.innerHTML = board.board[i][j];
            if (elem.innerHTML != '') {
                let label = document.createElement('p');
                label.classList.add('box-label');
                label.innerHTML = elem.innerHTML;
                elem.innerHTML = ''
                elem.appendChild(label);
            };
            elem.appendChild(number);
        };
    };
};

//// SOLVE ////

function getBoard() {
    let b = new Board(dimension);
    let boards = [b];
    for (let box of boxes) {
        let possible_boxes;
        if (box.operation == ' ') {
            possible_boxes = noOpTo(box.num);
        }
        else if (box.operation == '+') {
            possible_boxes = addTo(box.number, box.square_list.length);
        }
        else if (box.operation == '-') {
            possible_boxes = subtractTo(box.number, box.square_list.length);
        }
        else if (box.operation == 'x') {
            possible_boxes = multiplyTo(box.number, box.square_list.length);
        }
        else if (box.operation == '/') {
            possible_boxes = divideTo(box.number, box.square_list.length);
        };
        let possible_boards = []
        for (let b of boards) {
            let new_boards = b.branch(box, possible_boxes);
            for (c of new_boards) {
                if (c.checkValid()) {
                    possible_boards.push(c);
                };
            };
        };
        boards  = possible_boards;
    };
    return boards;
};

function addTo(sum, num) {
    let possible = [[]];
    for (let n = 0; n < num; n ++) {
        let new_poss = [];
        for (let i = 1; i <= dimension; i ++) {
            for (let p = 0; p < possible.length; p ++) {
                let new_p = [];
                for (let j = 0; j < possible[p].length; j ++) {
                    new_p.push(possible[p][j]);
                };
                new_p.push(i);
                new_poss.push(new_p);
            };
        };
        possible = new_poss
    };
    let valid = [];
    for (let p of possible) {
        total = 0;
        for (let i of p) {
            total += i;
        };
        if (total == sum) {
            valid.push(p);
        };
    };
    return valid;
};

function subtractTo(diff, num) {
    let possible = [[]];
    for (let n = 0; n < num; n ++) {
        let new_poss = [];
        for (let i = 1; i <= dimension; i ++) {
            for (let p = 0; p < possible.length; p ++) {
                let new_p = [];
                for (let j = 0; j < possible[p].length; j ++) {
                    new_p.push(possible[p][j]);
                };
                new_p.push(i);
                new_poss.push(new_p);
            };
        };
        possible = new_poss
    };
    let valid = [];
    for (let p of possible) {
        let total = 0;
        let first = true;
        let l = []
        for (let i = 0; i < p.length; i ++) {
            l.push(p[i])
        };
        while (l.length > 0) {
            let max = -1;
            let max_ind = -1;
            for (let i = 0; i < l.length; i ++) {
                if (l[i] > max) {
                    max = l[i];
                    max_ind = i;
                };
            };
            if (first) {
                total = max;
                first = false;
            }
            else {
                total -= max;
            };
            l.splice(max_ind, 1);
        };
        if (total == diff) {
            valid.push(p);
        };
    };
    return valid;
};

function multiplyTo(prod, num) {
    let possible = [[]];
    for (let n = 0; n < num; n ++) {
        let new_poss = [];
        for (let i = 1; i <= dimension; i ++) {
            for (let p = 0; p < possible.length; p ++) {
                let new_p = [];
                for (let j = 0; j < possible[p].length; j ++) {
                    new_p.push(possible[p][j]);
                };
                new_p.push(i);
                new_poss.push(new_p);
            };
        };
        possible = new_poss
    };
    let valid = [];
    for (let p of possible) {
        total = 1;
        for (let i of p) {
            total *= i;
        };
        console.log(total)
        if (total == prod) {
            valid.push(p);
        };
    };
    return valid;
};

function divideTo(quot, num) {
    let possible = [[]];
    for (let n = 0; n < num; n ++) {
        let new_poss = [];
        for (let i = 1; i <= dimension; i ++) {
            for (let p = 0; p < possible.length; p ++) {
                let new_p = [];
                for (let j = 0; j < possible[p].length; j ++) {
                    new_p.push(possible[p][j]);
                };
                new_p.push(i);
                new_poss.push(new_p);
            };
        };
        possible = new_poss
    };
    let valid = [];
    for (let p of possible) {
        let total = 0;
        let first = true;
        let l = []
        for (let i = 0; i < p.length; i ++) {
            l.push(p[i])
        };
        while (l.length > 0) {
            let max = -1;
            let max_ind = -1;
            for (let i = 0; i < l.length; i ++) {
                if (l[i] > max) {
                    max = l[i];
                    max_ind = i;
                };
            };
            if (first) {
                total = max;
                first = false;
            }
            else {
                total /= max;
            };
            l.splice(max_ind, 1);
        };
        if (total == quot) {
            valid.push(p);
        };
    };
    return valid;
};

function noOpTo(value) {
    return [[value]]
};