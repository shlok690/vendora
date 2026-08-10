marks=0
sum=0
while (i<=5):
    marks = int(input("Enter marks: "))
    sum = sum+marks
    i+=1
print("Total marks: ", sum)
average = sum / 5
print("Average marks: ", average)