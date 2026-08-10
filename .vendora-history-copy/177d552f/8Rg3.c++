#include<iostream>
using namespace std;
class demo
{
	public:
	int x,y;
	float ans;
	
	demo()
	{
	
	x=10;
	y=20;
	ans=0;
}
void add()
{
	ans=x+y;
	cout<<ans;
}
};
int main()
{
	demo d1;
	d1.add();
}