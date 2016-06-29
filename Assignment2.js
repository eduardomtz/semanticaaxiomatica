/// <reference path="default.html" />
/// <reference path="default.html" />
// JavaScript source code

// Alumno: Eduardo David Martínez Neri
// ITAM

////////////////
// Problem 2
///////////////

var NUM = "NUM";
var FALSE = "FALSE";
var VR = "VAR";
var PLUS = "PLUS";
var TIMES = "TIMES";
var LT = "LT";
var AND = "AND";
var NOT = "NOT";

var SEQ = "SEQ";
var IFTE = "IFSTMT";
var WHLE = "WHILESTMT";
var ASSGN = "ASSGN";
var SKIP = "SKIP";
var ASSUME = "ASSUME";
var ASSERT = "ASSERT";





function substitute(e, varName, newExp) {
    if (e.type == VR) {
        if (e.name === varName) {
            return newExp;
        } else {
            return e;
        }
    }
    if(e.type === NUM) {
        return e;
    }
    if(e.type === FALSE){
        return flse();
    }
    if(e.type == PLUS){
        var reP = substitute(e.left, varName, newExp);
        var leP = substitute(e.right, varName, newExp);
        return plus(reP, leP);
    }
    if(e.type == TIMES){
        var reP = substitute(e.left, varName, newExp);
        var leP = substitute(e.right, varName, newExp);
        return times(reP, leP);
    }
    if(e.type == LT){
        var reP = substitute(e.left, varName, newExp);
        var leP = substitute(e.right, varName, newExp);
        return lt(reP, leP);
    }
    if(e.type == AND){
        var reP = substitute(e.left, varName, newExp);
        var leP = substitute(e.right, varName, newExp);
        return and(reP, leP);
    }
    if(e.type == NOT){
        var eP = substitute(e.left, varName, newExp);
        return not(eP);
    }
}

function vc(cmd, predQ) {
    //predQ is an expression.
    //cmd is a statement.
	
    if (cmd.type == SKIP) {
        return predQ;
    }
    
	if (cmd.type == ASSERT) {
        return and(cmd.exp, predQ);
    }
	
    if(cmd.type == ASSGN) {
		return substitute(predQ, cmd.vr, cmd.val);
    }
    
    if(cmd.type == SEQ){

    	var Q = vc(cmd.snd, predQ);
        var S = vc(cmd.fst, Q);
        return S;
    }
	
    if(cmd.type == IFTE){
        var req1 = vc(cmd.tcase, predQ);
        var if1 =  and(cmd.cond, req1);
        var req2 = vc(cmd.fcase, predQ);
        var if2 = and(not(cmd.cond), req2);
        return or(if1, if2);
    }
    
	if(cmd.type == ASSUME)
    {
    	return or(not(cmd.exp), predQ);
    	//not( expr ) or predQ
    }
	
	if(cmd.type == WHLE) {
		
		var invariante = cmd.inv;
		
		var Prima = vc(cmd.body, invariante);
		
		var parte1 = or(not(cmd.cond), Prima);

		var parte2 = or(cmd.cond, predQ);
		
		var gen = and(parte1, parte2);
		
		var forall = or(not(invariante), gen);

        // substitute Vx,t
        // iterar state para sustituir las variables para cambio de scope
        var prog = eval(document.getElementById("p2input").value);
        var state = JSON.parse(document.getElementById("State").value);   
        state = interpretStmt(prog, state);
        
        for (var property in state) {
            forall = substitute(forall, property, vr('_' + property));
        }
		
		return and(invariante, forall);
	}
}

function interpretExpr(e, state) {
    if (e.type == NUM) { 
	return e.val; 
	}
    if (e.type == FALSE) { 
	return false; 
	}
    if (e.type == VR) { 
	return state[e.name]; 
	}
    if (e.type == PLUS) { 
	return interpretExpr(e.left, state) + interpretExpr(e.right, state);
	}
    if (e.type == TIMES) { 
	return interpretExpr(e.left, state) * interpretExpr(e.right, state);
	}
    if (e.type == LT) { 
	return interpretExpr(e.left, state) < interpretExpr(e.right, state);
	}
    if (e.type == AND) { 
	return interpretExpr(e.left, state) && interpretExpr(e.right, state);
	}
    if (e.type == NOT) { 
	return !interpretExpr(e.left, state);
	}
}


function interpretStmt(c, state) {
    if (c.type == SEQ) {
        var sigmaPP = interpretStmt(c.fst, state);
        var sigmaP = interpretStmt(c.snd, sigmaPP);
        return sigmaP;
    }
    
    if (c.type == IFTE){
        if(interpretExpr(c.cond, state) == false){
            var sigmaP = interpretStmt(c.fcase, state);
            return sigmaP;
        } else {
            var sigmaPP = interpretStmt(c.tcase, state);
            return sigmaPP;
        }
    }
    
    if (c.type == WHLE){
        if(interpretExpr(c.cond, state) == false){
            return state;
        } else {
            var sigmaPP = interpretStmt(c.body, state);
            var sigmaP = interpretStmt(c, sigmaPP);
            return sigmaP;
        }
    }
    
    if(c.type == ASSGN) {
        state[c.vr] = interpretExpr(c.val, state);
        return state;
    }
    
    if(c.type == ASSUME) {
        return state;
    }
    
    if(c.type == SKIP) {
        return state;
    }
    
    if(c.type == ASSERT) {
        return state;
    }
}


function str(obj) { return JSON.stringify(obj); }

//Constructor definitions for the different AST nodes.

function flse() {
    return { type: FALSE, 
	toString: function () { return "false"; }, 
	toStringZ3: function() { return "false"; } };
}

function vr(name) {
    return { type: VR, name: name, 
	toString: function () { return this.name; }, 
	toStringZ3: function () { return this.name; }};
}
function num(n) {
    return { type: NUM, val: n, 
	toString: function () { return this.val; }, 
	toStringZ3: function () { return this.val; } };
}
function plus(x, y) {
    return { type: PLUS, left: x, right: y, 
	toString: function () { return "(" + this.left.toString() + "+" + this.right.toString() + ")"; }, 
	toStringZ3: function () { return "(+ " + this.left.toStringZ3() + " " + this.right.toStringZ3() + ")"; } };
}
function times(x, y) {
    return { type: TIMES, left: x, right: y, 
	toString: function () { return "(" + this.left.toString() + "*" + this.right.toString() + ")"; }, 
	toStringZ3: function () { return "(* " + this.left.toStringZ3() + " " + this.right.toStringZ3() + ")"; } };
}
function lt(x, y) {
    return { type: LT, left: x, right: y, 
	toString: function () { return "(" + this.left.toString() + "<" + this.right.toString() + ")"; }, 
	toStringZ3: function () { return "(< " + this.left.toStringZ3() + " " + this.right.toStringZ3() + ")"; } };
}
function and(x, y) {
    return { type: AND, left: x, right: y, 
	toString: function () { return "(" + this.left.toString() + "&&" + this.right.toString() + ")"; }, 
	toStringZ3: function () { return "(and " + this.left.toStringZ3() + " " + this.right.toStringZ3() + ")"; } };
}
function not(x) {
    return { type: NOT, left: x, 
	toString: function () { return "(!" + this.left.toString() + ")"; }, 
	toStringZ3: function () { return "(not " + this.left.toStringZ3() + ")"; } };
}
function seq(s1, s2) {
    return { type: SEQ, fst: s1, snd: s2, 
	toString: function () { return "" + this.fst.toString() + ";\n" + this.snd.toString(); }, 
	toStringZ3: function () { return " {[[[ seq " + this.fst.toStringZ3() + "\n" + this.snd.toStringZ3()+" ]]]}"; } };
}
function assume(e) {
    return { type: ASSUME, exp: e, 
	toString: function () { return "assume " + this.exp.toString(); } }; // , 
	// toStringZ3: function () { return "(=> " + this.exp.toStringZ3() + ")"; } };
}
function assert(e) {
    return { type: ASSERT, exp: e, 
	toString: function () { return "assert " + this.exp.toString(); } }; // , 
	// toStringZ3: function () { return "(assert (" + this.exp.toStringZ3() + "))"; } };
}
function assgn(v, val) {
    return { type: ASSGN, vr: v, val: val, 
	toString: function () { return "" + this.vr + ":=" + this.val.toString(); } }; //, 
	// toStringZ3: function () { return "(= " + this.vr + " " + this.val.toStringZ3() + ")" } };
}
function ifte(c, t, f) {
    return { type: IFTE, cond: c, tcase: t, fcase: f, 
	toString: function () { return "if(" + this.cond.toString() + "){\n" + this.tcase.toString() + '\n}else{\n' + this.fcase.toString() + '\n}'; } }; // , 
	// toStringZ3: function () { return "(ite (" + this.cond.toStringZ3() + ") " + this.tcase.toStringZ3() + " " + this.fcase.toStringZ3() + ")"; } };
}
function whle(c, i, b) {
    return { type: WHLE, cond: c, inv: i, body: b, 
	toString: function () { return "while(" + this.cond.toString() + "){\n" + this.body.toString() + '\n}'; } };
}
function skip() {
    return { type: SKIP, toString: function () { return "/*skip*/"; } };
}

//some useful helpers:
function or(x,y){
    return not(and(not(x),not(y)));
}
function eq(x, y) {
    return and(not(lt(x, y)), not(lt(y, x)));
}
function gt(x, y){
	return lt(y, x);
}
function gteq(x, y){
	return not(lt(x, y));
}
function tru() {
    return not(flse());
}
function block(slist) {
    if (slist.length == 0) {
        return skip();
    }
    if (slist.length == 1) {
        return slist[0];
    } else {
        return seq(slist[0], block(slist.slice(1)));
    }
}

//The stuff you have to implement.
function computeVC(prog) {
    //Compute the verification condition for the program leaving some kind of place holder for loop invariants.
    var mywpc = vc(prog, tru());

    var respuesta = "(set-option :interactive-mode true)";
    
    var prog = eval(document.getElementById("p2input").value);
    var state = JSON.parse(document.getElementById("State").value);   
    state = interpretStmt(prog, state);
    
    for (var property in state) {
        // substitute(forall, property, vr('_' + property));
        respuesta += "\n(declare-fun " + property + " () Int)";
        respuesta += "\n(declare-fun _" + property + " () Int)";
    }
    
    respuesta += "\n(assert (not " + mywpc.toStringZ3() + "))";
    respuesta += "\n(check-sat)";
    respuesta += "\n(exit)";
    return respuesta;
}

function interp() {
    var prog = eval(document.getElementById("p2input").value);
    var state = JSON.parse(document.getElementById("State").value);    
    clearConsole();
    writeToConsole("Just pretty printing for now");
    writeToConsole(prog.toString());
	writeToConsole("Final state: " + JSON.stringify(interpretStmt(prog, state)));
}

function genVC() {
    var prog = eval(document.getElementById("p2input").value);
    clearConsole();
	
    /*
	writeToConsole("Just pretty printing for now");
    writeToConsole(prog.toString());
    // writeToConsole(mywpc.toString());
	writeToConsole("Z3:");
	*/
	
	var mywpc = vc(prog, tru());
	writeToConsole("(set-option :interactive-mode true)");
	
	var prog = eval(document.getElementById("p2input").value);
	var state = JSON.parse(document.getElementById("State").value);   
	state = interpretStmt(prog, state);
	
	for (var property in state) {
		// substitute(forall, property, vr('_' + property));
		writeToConsole("(declare-fun " + property + " () Int)");
		writeToConsole("(declare-fun _" + property + " () Int)");
	}
	
	writeToConsole("(assert (not " + mywpc.toStringZ3() + "))");
	writeToConsole("(check-sat)");
	writeToConsole("(exit)");
}

function writeToConsole(text) {
    var csl = document.getElementById("console");
    if (typeof text == "string") {
        csl.textContent += text + "\n";
    } else {
        csl.textContent += text.toString() + "\n";
    }
}

function clearConsole() {
    var csl = document.getElementById("console");
    csl.textContent = "";
}
