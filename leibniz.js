

// Tyler Crabtree

// Non-wildcard version of smatch.
//


// Function written by cochran
function smatch1(pattern, target) {
    if (typeof pattern === "number" || typeof pattern == "string")
        return pattern === target;          // same number or string
    else
        return pattern instanceof Array &&  // pattern and
               target instanceof Array &&   // target are arrays
               pattern.length === target.length &&    // of the same length
               pattern.every(function(elem, index) {  // and recursively
                   return smatch1(elem, target[index]); // contain same elems
               });
}





// smatch function
function smatch(pattern, target, table) {
    table = table || {}

   if (pattern === target){      
       if(typeof pattern === "string"){        
           return table;  
          }
        return table;
    }
    else if (typeof pattern === "string" ){
        if(pattern.substr(-1) === '?'){
            newPattern = pattern.substring(0, pattern.length - 1);
            table[newPattern] = target;
            return table;
        }
    }
   else  
        if(!(pattern instanceof Array &&  // pattern and
               target instanceof Array &&   // target are arrays
               pattern.length === target.length && // &&    // of the same length
               pattern.every(function(elem, index) {  // and recursively
                 return smatch(elem, target[index], table); // contain same elems
               })))
    return null      
        else return table;
    
}





// cochran function
var diffPowerRule = {
    pattern : function(target, table) {
        return smatch(['DERIV', ['^', 'E?', 'N?'], 'V?'], target, table) &&
            typeof table.N === "number";
    },
    transform: function(table) {
        return ['*', ['*', table.N, ['^', table.E, table.N - 1]], 
                ['DERIV', table.E, table.V]];
    },
    label: "diffPowerRule"
};

//
//  d/dt t = 1
//
// cochran function

var diffXRule = {
    pattern : function(target, table) {
        return smatch(['DERIV', 'E?', 'V?'], target, table) &&
            table.E === table.V;
    },
    transform: function(table) {
        return 1;
    },
    label: "diffXRule"
};

//
// (u + v)' = u' + v'
//
var diffSumRule = {
    pattern: function(target, table) {
        return smatch(['DERIV', ['+', 'E?', 'N?'] , 'V?'], target, table);

    },
    transform: function(table) {
    return  ['+' , ['DERIV', table.E, table.V ],  ['DERIV' , table.N , table.V ]];

       // return false;
        // ...your code here...
    },
    label: "diffSumRule"
};


function check(first,second) {
    if(typeof first === 'object'){
        for (var i = 0; i < first.length; i++){
            if(first[i] === second){
             return true;
         }
       else{
             if( check(first[i], second)){
             return true;
            
            
                }

        }
    
      }
     }
    return false;


}

//
// d/dt C = 1   (C does not depend on t)
//
var diffConstRule = {
    pattern: function(target, table) {
        // ...your code here...
        return smatch(['DERIV',"E?","V?"], target, table) && (!(check(table.E, table.V))); 
    },
    transform: function(table) {
        
         return 0; // contain same elems
            
        // ...your code here...
    },
    label: "diffConstRule"
};




//
// (u - v)' = u' - v'
//
var diffSubtractRule = {
    pattern: function(target, table) {

        // ...your code here...
        return smatch(['DERIV', ['-', 'E?', 'N?'] , 'V?'], target, table);
    },
    transform: function(table) {
            return  ['-' , ['DERIV', table.E, table.V ],  ['DERIV' , table.N , table.V ]];

        // ...your code here...
    },
    label: "diffSubtractRule"
};


//
// (u v)' = uv' + vu'
//
var diffProductRule = {
    pattern: function(target, table) {
        //typicl calulus calculus 
        return smatch(['DERIV', ['*', 'E?', 'N?'] , 'V?'], target, table);
    },
    transform: function(table) {
            return  ['+' , [ '*' , table.E , ['DERIV', table.N, table.V ]],  ['*', ['DERIV', table.E, table.V ], table.N] ];

        // ...your code here...
    },
    label: "diffProductRule"
};

//
// 3 + 4 = 7   (evaluate constant binary expressions)
//

//this function basically just finds out and uses the correct opperand

var foldBinopRule = {
    pattern: function(target, table) {
        return smatch(['V?', 'E?', 'N?' ], target, table ) && ( typeof table.E === "number") && (typeof table.N === "number");
    },
    transform: function(table) {

        if (table.V === '+'){
        return ( table.E +  table.N);
        }
       else   if (table.V === '-'){
        return ( table.E -  table.N);
        }

       else if (table.V === '*'){
        return ( table.E *  table.N);
        }
      else    if (table.V === '/'){
        return ( table.E /  table.N);
        }
      else     if (table.V === '^'){
        return  Math.pow(table.E ,table.N)  ;
        }
    

        // ...your code here...
    },
    label: "foldBinopRule"
};

//
// 3*(2*E) = 6*E  : [*, a, [*, b, e]] => [*, (a*b), e]
//
var foldCoeff1Rule = {
    pattern: function(target, table) {
        // ...your code here...
        return  smatch(['*', 'E?', ['*', 'N?', 'V?']], target, table ) && ( typeof table.E === "number") && (typeof table.N === "number");
    },
    transform: function(table) {
        return ['*', (table.E * table.N), table.V ];
        // ...your code here...
    },
    label: "foldCoeff1Rule"
};

//
//  x^0 = 1
//
var expt0Rule = {
    pattern: function(target, table) {
        // ...your code here...
        return smatch( [  '^' , 'E?', 0], target, table );
    },
    transform: function(table) {
        return 1;
        // ...your code here...
    },
    label: "expt0Rule"
};

//
//  x^1 = x
//
var expt1Rule = {
    pattern: function(target, table) {
        return smatch( [  '^' , 'E?', 1], target, table ) ;
       // return false;
    },
    transform: function(table) {
        return table.E;
        // ...your code here...
    },
    label: "expt1Rule"
};

//
//  E * 1 = 1 * E = 0 + E = E + 0 = E
//
var unityRule = {
    pattern: function(target, table) {
        // ...your code here...
        return smatch([ '*', 'E?' , 1], target, table) || smatch([ '*', 1,  'E?'], target, table) || smatch([ '+', 'E?' , 0], target, table)  || smatch([ '+',  0, 'E?' ], target, table)  ;
    },
    transform: function(table) {

        return table.E;
        // ...your code here...
    },
    label: "unityRule"
};

//
// E * 0 = 0 * E = 0
//
var times0Rule = {
    pattern: function(target, table) {

        // so basically if either terms are zero, return zero
        return smatch(['*' , 'E?', 0] ,target, table) || (smatch(['*' , 0, 'E?'] , target, table)) ;
    },
    transform: function(table) {
        //easy, always returns zero
        return 0;
    },
    label: "time0Rule"
};

//
// Try to apply "rule" to "expr" recursively -- rule may fire multiple times
// on subexpressions.
// Returns null if rule is *never* applied, else new transformed expression.
// 
function tryRule(rule, expr) {
    var table = {}
    if (!(expr instanceof Array))  // rule patterns match only arrays
        return null;
    else if (rule.pattern(expr, table)) { // rule matches whole expres
        console.log("rule " + rule.label + " fires.");
        return rule.transform(table);     // return transformed expression
    } else { // let's recursively try the rule on each subexpression
        var anyFire = false;
        var newExpr = expr.map(function(e) {
            var t = tryRule(rule, e);
            if (t !== null) {     // note : t = 0 is a valid expression
                anyFire = true;   // at least one rule fired
                return t;         // return transformed subexpression
            } else {
                return e;         // return original subexpression
            }
        });
        return anyFire ? newExpr : null;
    }
}

//
// Try transforming the given expression using all the rules.
// If any rules fire, we return the new transformed expression;
// Otherwise, null is returned.
//
function tryAllRules(expr) {


    //Cleaning up code
    //pretty easy, bascially just call call tryRule on all the functions. 

    //1
     if( tryRule(diffPowerRule, expr) != null){
        return  tryRule(diffPowerRule, expr);
   }


   //2
   if( tryRule(diffXRule, expr) != null){
        return  tryRule(diffXRule, expr);

   }
    //3
   if( tryRule(diffSumRule, expr) != null){
        return  tryRule(diffSumRule, expr);

   }
   //4
   if( tryRule(diffSubtractRule, expr) != null){
        return  tryRule(diffSubtractRule, expr);

   }
   //5
   if( tryRule(diffConstRule, expr) != null){
        return  tryRule(diffConstRule, expr);

   }
   //6
   if( tryRule(diffProductRule, expr) != null){
        return  tryRule(diffProductRule, expr);

   }
   //7
   if( tryRule(foldBinopRule, expr) != null){
        return  tryRule(foldBinopRule, expr);

   }

   //7
   if( tryRule(foldCoeff1Rule, expr) != null){
        return  tryRule(foldCoeff1Rule, expr);

   }
   //8
   if( tryRule(expt0Rule, expr) != null){
        return  tryRule(expt0Rule, expr);

   }


   //9
   if( tryRule(expt1Rule, expr) != null){
        return  tryRule(expt1Rule, expr);

   }

   //10  
   if( tryRule(unityRule, expr) != null){
        return  tryRule(unityRule, expr);

   }

   //11
   if( tryRule(times0Rule, expr) != null){
        return  tryRule(times0Rule, expr);

   }

return null;
    
  
  
 




}



////// Cochran code below

//
// Repeatedly try to reduce expression by applying rules.
// As soon as no more rules fire we are done.
//
function reduceExpr(expr) {
    var e = tryAllRules(expr);
    return (e != null) ? reduceExpr(e) : expr;
}

//if (diffPowerRule.pattern(['DERIV', ['^', 'X', 3], 'X'], table)) {
//     var f = diffPowerRule.transform(table);
//     console.log(f);
// }

//
// Node module exports.
//
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    exports.smatch = smatch;
    exports.diffPowerRule = diffPowerRule;
    exports.tryRule = tryRule;

    exports.diffXRule = diffXRule;
    exports.diffSumRule = diffSumRule;
    exports.diffConstRule = diffConstRule;
    exports.diffProductRule = diffProductRule;
    exports.foldBinopRule = foldBinopRule;
    exports.foldCoeff1Rule = foldCoeff1Rule;
    exports.expt0Rule = expt0Rule;
    exports.expt1Rule = expt1Rule;
    exports.unityRule = unityRule;
    exports.times0Rule = times0Rule;

    exports.tryAllRules = tryAllRules;
    exports.reduceExpr = reduceExpr;
}
