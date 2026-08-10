
import ast
import operator
from collections import deque

# Allowed binary operators mapping
BINOPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
    ast.FloorDiv: operator.floordiv,
}

# Allowed unary operators
UNARYOPS = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}

class SafeEval(ast.NodeVisitor):
    """AST visitor that safely evaluates arithmetic expressions."""
    def visit(self, node):
        if isinstance(node, ast.Expression):
            return self.visit(node.body)
        return super().visit(node)

    def visit_BinOp(self, node):
        left = self.visit(node.left)
        right = self.visit(node.right)
        op_type = type(node.op)
        if op_type in BINOPS:
            try:
                return BINOPS[op_type](left, right)
            except Exception as e:
                raise ValueError(f"Error in operation: {e}")
        raise ValueError(f"Operator {op_type._name_} not allowed")

    def visit_UnaryOp(self, node):
        operand = self.visit(node.operand)
        op_type = type(node.op)
        if op_type in UNARYOPS:
            return UNARYOPS[op_type](operand)
        raise ValueError(f"Unary operator {op_type._name_} not allowed")

    def visit_Num(self, node):  # Python <3.8
        return node.n

    def visit_Constant(self, node):  # Python 3.8+
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError("Only numeric constants are allowed")

    def visit_Expr(self, node):
        return self.visit(node.value)

    def generic_visit(self, node):
        # Disallow names, calls, attributes, etc.
        raise ValueError(f"Invalid expression element: {type(node)._name_}")

def safe_eval(expr: str):
    """Safely evaluate an arithmetic expression string and return a number."""
    try:
        parsed = ast.parse(expr, mode='eval')
        evaluator = SafeEval()
        return evaluator.visit(parsed)
    except SyntaxError:
        raise ValueError("Syntax error in expression")
    except ValueError as e:
        raise

def print_menu():
    print("\nSimple Python Calculator")
    print(" - Type a math expression (e.g. 2+3*4, (1+2)**3, 10//3, 7%3)")
    print(" - Commands: :history  :clear  :exit  :help")
    print(" - Supported operators: +  -  *  /  **  %  //  and parentheses\n")

def main():
    history = deque(maxlen=50)
    print_menu()

    while True:
        try:
            s = input("calc> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not s:
            continue

        if s.lower() in (":exit", ":quit", "quit", "exit"):
            print("Exiting calculator. Bye!")
            break
        if s.lower() == ":help":
            print_menu()
            continue
        if s.lower() == ":history":
            if not history:
                print("(no history yet)")
            else:
                for i, (expr, result) in enumerate(history, 1):
                    print(f"{i}: {expr} = {result}")
            continue
        if s.lower() == ":clear":
            history.clear()
            print("History cleared.")
            continue

        # Try to evaluate expression
        try:
            result = safe_eval(s)
            # Normalize integers that are mathematically integers
            if isinstance(result, float) and result.is_integer():
                result = int(result)
            print(result)
            history.append((s, result))
        except ValueError as e:
            print("Error:", e)
        except ZeroDivisionError:
            print("Error: Division by zero")

if __name__== "_main_":
    main()
    