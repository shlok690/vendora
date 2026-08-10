# Calculator Project in Python
import math
import ast
import operator as op

# Operators mapping for safe eval
ALLOWED_BINOPS = {
    ast.Add: op.add,
    ast.Sub: op.sub,
    ast.Mult: op.mul,
    ast.Div: op.truediv,
    ast.Mod: op.mod,
    ast.Pow: op.pow,
}
ALLOWED_UNARYOPS = {
    ast.UAdd: lambda x: x,
    ast.USub: lambda x: -x,
}

def safe_eval(expr: str):
    expr = expr.replace('^', '**')
    node = ast.parse(expr, mode='eval')
    def _eval(n):
        if isinstance(n, ast.Expression):
            return _eval(n.body)
        if isinstance(n, ast.Constant): return n.value
        if isinstance(n, ast.Num): return n.n
        if isinstance(n, ast.BinOp):
            return ALLOWED_BINOPS[type(n.op)](_eval(n.left), _eval(n.right))
        if isinstance(n, ast.UnaryOp):
            return ALLOWED_UNARYOPS[type(n.op)](_eval(n.operand))
        raise ValueError("Unsupported operation")
    return _eval(node)

def main():
    history = []
    last_ans = None
    while True:
        print("\n--- Calculator ---")
        print("1. Add\n2. Subtract\n3. Multiply\n4. Divide\n5. Modulus\n6. Power\n7. Square Root\n8. Expression Eval\n9. History\n0. Exit")
        choice = input("Enter choice: ")

        if choice == '0':
            print("Exiting... Goodbye!")
            break
        elif choice in ['1','2','3','4','5','6']:
            a = float(input("Enter first number: "))
            b = float(input("Enter second number: "))
            if choice == '1': res = a+b
            elif choice == '2': res = a-b
            elif choice == '3': res = a*b
            elif choice == '4': res = "Error" if b==0 else a/b
            elif choice == '5': res = "Error" if b==0 else a%b
            elif choice == '6': res = a**b
            print("Result:", res)
            history.append(res)
        elif choice == '7':
            a = float(input("Enter number: "))
            res = math.sqrt(a) if a>=0 else "Error"
            print("Result:", res)
            history.append(res)
        elif choice == '8':
            expr = input("Enter expression: ")
            try:
                res = safe_eval(expr)
                print("Result:", res)
                history.append(res)
            except:
                print("Invalid expression")
        elif choice == '9':
            print("History:", history)
        else:
            print("Invalid choice")

if _name_ == "_main_":
    main()
    
