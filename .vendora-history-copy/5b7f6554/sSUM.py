# Python Calculator (simplified)
import math, ast, operator as op
ALLOWED_BINOPS = {ast.Add:op.add, ast.Sub:op.sub, ast.Mult:op.mul, ast.Div:op.truediv, ast.Mod:op.mod, ast.Pow:op.pow}
ALLOWED_UNARYOPS = {ast.UAdd: lambda x:x, ast.USub: lambda x:-x}

def safe_eval(expr,last_ans=None):
    expr = expr.replace('^','**')
    node=ast.parse(expr,mode='eval')
    def _eval(n):
        if isinstance(n,ast.Expression): return _eval(n.body)
        if isinstance(n,ast.Constant): return n.value
        if isinstance(n,ast.BinOp): return ALLOWED_BINOPS[type(n.op)](_eval(n.left),_eval(n.right))
        if isinstance(n,ast.UnaryOp): return ALLOWED_UNARYOPS[type(n.op)](_eval(n.operand))
        if isinstance(n,ast.Name) and n.id=="ans": return last_ans
        raise ValueError("Unsupported operation")
    return _eval(node)

def main():
    history, last_ans = [], None
    operations={"1":("Add",lambda a,b:a+b),"2":("Subtract",lambda a,b:a-b),"3":("Multiply",lambda a,b:a*b),
                "4":("Divide",lambda a,b:a/b if b!=0 else None),"5":("Modulus",lambda a,b:a%b if b!=0 else None),
                "6":("Power",lambda a,b:a**b),"7":("Square Root",lambda a:math.sqrt(a) if a>=0 else None)}
    while True:
        print("\n1.Add 2.Subtract 3.Multiply 4.Divide 5.Modulus 6.Power 7.Sqrt\n8.Expression 9.History 0.Exit")
        choice=input("Enter choice: ")
        if choice=="0": break
        elif choice in operations:
            if choice=="7": a=float(input("Enter number: ")); res=operations[choice][1](a)
            else: a=float(input("Enter first number: ")); b=float(input("Enter second number: ")); res=operations[choice][1](a,b)
            if res is None: print("Error"); continue
            print("Result:",res); history.append(res); last_ans=res
        elif choice=="8":
            expr=input("Enter expression (use ans for last result): ")
            try: res=safe_eval(expr,last_ans); print("Result:",res); history.append(res); last_ans=res
            except Exception as e: print("Invalid:",e)
        elif choice=="9":
            print("History:" if history else "History is empty")
            [print(f"{i+1}. {v}") for i,v in enumerate(history)]
        else: print("Invalid choice")
    print("Goodbye!")
if _name=="main_": main(