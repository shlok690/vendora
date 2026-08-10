#include <stdio.h>


 factorial(int n) {
    if (n == 0 || n == 1)
        return 1;
    else
        return n * factorial(n - 1);
}

int main() {
    int number;
    printf("Enter a positive integer: ");
    scanf("%d", &number);

    if (number < 0) {
        printf("Factorial is not defined for negative numbers.\n");
    } else {
        long long result = factorial(number);
        printf("Factorial of %d = %lld\n", number, result);
    }

    return 0;
}
