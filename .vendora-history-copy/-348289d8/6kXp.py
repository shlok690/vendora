marks=0
sum=0
i=1
while (i<=5):
    marks = int(input("Enter marks: "))
    sum = sum+marks
    i = i + 2
print("Total marks: ", sum)
average = sum / 5
print("Average marks: ", average)