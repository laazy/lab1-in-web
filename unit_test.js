/**
 * Created by 61640 on 2017/7/31.
 */
/**
 * Created by 61640 on 2017/7/25.
 */
var pos=0;
var parse="";
var buffer;
var if_buffer=false;
var put_back=Array(0,0);
var if_put=false;
function putBack(a)
{
    if (if_put)
        throw "Already put";
    put_back=a;
    if_put=true;
}
function getNumber()
{
    var ans="";
    while (true)
    {
        var now=parse[pos];
        var flag=false;
        switch (now)
        {
            case"0":case"1":case"2":case"3":case"4":case"5":case"6":case"7":case"8":case"9":case".":
            ans+=now;
            break;
            default:
                flag=true;
        }
        if (flag)
            break;
        pos++;
    }
    return Number(ans);
}

function getChar()
{
    pos++;
    return parse[pos-1];
}

function getString(a)
{
    var ans="";
    for (;a!=0;a--)
        ans+=getChar();
    return ans;
}
function get() { //获取输入的实现
    if (if_put)
    {
        if_put=false;
        return put_back;
    }
    var ch = getChar();
    switch (ch)
    {
        case ';':
        case'(':
        case')':
        case'+':
        case'-':
        case'*':
        case'/':
        case'!':
        case'%':
        case'M':
            var arr = new Array(ch, 0);
            return arr;
            break;
        case'p'://处理常量
            var temp = getChar();
            if (temp == 'i') {
                var pi = new Array(8,3.1415926);
                return pi;
            }
            else throw "Bad Token";
            break;
        case'e':
            return Array(8,2.71828);
            break;
        //处理记忆
        case'R':
            if (!if_buffer)
                return Array(8,buffer);
            else
                throw  "Bad Token";
            break;
        case'.'://若接下来的符号为数字的一部分时，将读取内容返回缓存区，并读取出一个浮点数
        case'0':
        case'1':
        case'2':
        case'3':
        case'4':
        case'5':
        case'6':
        case'7':
        case'8':
        case'9':
            pos--;
            return Array(8,getNumber());
        case's':
            var temp = getString(2);
            if (temp == "in")
                return Array(ch, 0);
            else if (temp == "qr")
                if (getChar() == "t")
                    return Array("g", 0);
                else throw "Bad Token";
        case'c': {
            var temp = getString(2);
            if (temp == "os")
                return Array(ch, 0);
            else
                throw "Bad Token";
        }
        case't': {
            var temp = getString(2);
            if (temp == "an")
                return Array(ch, 0);
            else
                throw "Bad Token";
        }
        case'a': {
            var temp = getString(3);

            if (temp == "sin")
                return Array("a", 0);
            if (temp == "cos")
                return Array("x", 0);
            if (temp == "tan")
                return Array("r", 0);
            else
                throw "Bad Token";
        }
        case'l': {
            var temp = getChar();
            if (temp == 'n')
                return Array("n", 0);
            else
                throw "Bad Token";
        }
        case'^':
            return Array(ch, 0);
        default://若输入包含不属于以上字符时，报错
            throw "BadToken";
    }
}

function rangeCheck(d,  l,  r)
{
    if (l<d&&d<r)
        return true;
    return false;

}


function intRank( a)
{//通过递归计算阶乘
    return intRank(a - 1)*a;
}
function primary() {//primary的实现细节
    var t = get();
    switch (t[0]) {
        case  8://数字与阶乘
            var l = get();
            if (l[0] == '!')
                return intRank(t[0]);
            if (l[0] == '^')
            {
                var temp_left = primary();
                return Math.pow(t[0], temp_left);
            }
            else {
                putBack(l);
                return t[1];
            }
        case's'://处理数学函数
            return Math.sin(primary());
        case'c':
            return Math.cos(primary());
        case't':
            return Math.tan(primary());
        case'a':
        {
            var left = primary();
            if (rangeCheck(left, -1, 1))
                return Math.asin(left);
            else
                throw "Out Of Range";
        }
        case'x':
        {
            var left = primary();
            if (rangeCheck(left, -1, 1))
                return Math.acos(left);
            else
                throw "Out Of Range";
        }
        case'r':
            return Math.atan(primary());
        case'l':
        {
            var left = primary();
            if (left>0)
                return Math.log(left);
            else
                throw "Out Of Range";
        }
        case'g':
        {
            var left = primary();
            if (left>0)
                return Math.sqrt(left);
            else if (left == 0)
                return 0;
            else
                throw "Out Of Range";
        }
        case '-'://处理一元运算
            return -primary();
        case '+':
            return primary();
        case'(': {//处理括号
            var d = expression();
            t = get();
            if (t[0]!= ')')throw "BracketExpected";//error("')' expected!");
            var l = get();
            if (l[0] == '!')
                d = intRank(d);
            else
                putBack(t);
            return d; }
        default:
            throw "PrimaryExpected";
        //error("primary expected");
    }
}
function term() {
    var left = primary();
    var t = get();
    while (true) {
        switch (t[0]) {
            case'*'://处理乘号
                left *= primary();
                t = get();
                break;
            case'/': {//处理除号
                var temp = primary();
                if (temp == 0)throw"ZeroDivision"//error("division by zero");
                left /= temp;
                t = get();
                break; }
            case'%': {//处理模
                var temp = primary();
                var temp1 = temp%1;
                var temp2 = left%1;
                if (temp1 != temp)throw "DivisionInt";//error("% right expected a int");
                if (temp2 != left)throw "DivisionInt";//error("% left expected a int");
                if (temp1 == 0)throw "ZeroDivision";//error("0 division erro");
                left = temp2%temp1;
                t = get();
                break;
            }
            default:
                putBack(t);
                return left;
        }
    }
}
function expression() {
    var left = term();
    var t = get();
    while (true) {
        switch (t[0]) {
            case'+'://处理加号
                left += term();
                t = get();
                break;
            case'-'://处理减号
                left -= term();
                t = get();
                break;
            default:
                putBack(t);
                return left;
        }
    }
}
function calculate()
{
    //判断输入是否有效，无效则中断
    try {
        parse+=';';
        var left = expression();
        var t = get();
        switch (t[0])
        {
            case'M'://记忆算式结果，并直接输出
                buffer = left;
                if_buffer = true;
                var l = get();
            case ';'://当最后一个字符为输出提示符时，输出
                pos=0;
                return left;
            default:
                pos=0;
                return "Wrong expression!";
            //break;
        }
    }
    catch (str)
    {
        pos=0;
        return str;
    }

}

function calcu(str)
{
    //document.getElementById("result_display").value =str;
    if (str=="=") {
        parse+=";";
        document.getElementById("result_display").value = calculate();
        parse=parse.substring(0,parse.length-1);
    }
    else if (str=="AC")
    {
        document.getElementById("txt_display").value="";
        document.getElementById("result_display").value="";
        parse="";
    }
    else if(str=="DEL") {
        parse=parse.substring(0,parse.length-1);
        document.getElementById("txt_display").value=parse;
    }
    else {
        parse += str;
        document.getElementById("txt_display").value = parse;
    }

}

function clear()
{
    pos=0;
    parse="";
    put_back=Array(0,0);
    if_put=false;
    buffer=0;
    if_buffer=false;
}

var compare=require("assert");

//测试加法
function test1()
{
    parse="1+1";
    var result = calculate();
    compare.equal(result,2,"wrong");
    clear();
}
//测试减法
function test2()
{
    parse="1-4";
    var result = calculate();
    compare.equal(result,-3,"wrong");
    clear();
}
//测试乘法
function test3()
{
    parse="1*6";
    var result = calculate();
    compare.equal(result,6,"wrong");
    clear();
}

function test4()
{
    parse="1*0";
    var result = calculate();
    compare.equal(result,0,"wrong");
    clear();
}
//测试除法
function test5()
{
    parse="6/2";
    var result = calculate();
    compare.equal(result,3,"wrong");
    clear();
}

function test6()
{
    parse="1/0";
    var result = calculate();
    compare.equal(result,"ZeroDivision","wrong");
    clear();
}
//取模测试
function test7()
{
    parse="5%2";
    var result = calculate();
    compare.equal(result,1,"wrong");
    clear();
}

function test8()
{
    parse="5%0";
    var result = calculate();
    compare.equal(result,"ZeroDivision","wrong");
    clear();
}

function test9()
{
    parse="1.2%1";
    var result = calculate();
    compare.equal(result,"DivisionInt","wrong");
    clear();
}

function test10()
{
    parse="1%1.2";
    var result = calculate();
    compare.equal(result,"DivisionInt","wrong");
    clear();
}
//测试阶乘
function test11()
{
    parse="4!";
    var result = calculate();
    compare.equal(result,24,"wrong");
    clear();
}


function test12()
{
    parse="(1+4)!";
    var result = calculate();
    compare.equal(result,120,"wrong");
    clear();
}

function test13()
{
    parse="1.5!";
    var result = calculate();
    compare.equal(result,"intExpect","wrong");
    clear();
}

function test14()
{
    parse="(-2)!";
    var result = calculate();
    compare.equal(result,"PositiveExpected","wrong");
    clear();
}
//测试正弦函数
function test15()
{
    parse="sin0";
    var result = calculate();
    compare.equal(result,0,"wrong");
    clear();
}
//测试余弦函数
function test16()
{
    parse="cos0";
    var result = calculate();
    compare.equal(result,1,"wrong");
    clear();
}
//测试正切函数
function test17()
{
    parse="tan0";
    var result = calculate();
    compare.equal(result,0,"wrong");
    clear();
}
//测试反正弦函数
function test18()
{
    parse="asin0";
    var result = calculate();
    compare.equal(result,0,"wrong");
    clear();
}
//测试反余弦函数
function test19()
{
    parse="acos1";
    var result = calculate();
    compare.equal(result,0,"wrong");
    clear();
}
//测试反正切函数
function test20()
{
    parse="atan0";
    var result = calculate();
    compare.equal(result,0,"wrong");
    clear();
}
//测试自然对数
function test21()
{
    parse="ln1";
    var result = calculate();
    compare.equal(result,0,"wrong");
    clear();
}
//测试memory
function tes22()
{
    parse="2+3M";
    calculate();
    parse="R*3";
    var result = calculate();
    compare.equal(result,6,"wrong");
    clear();
}
//函数错误测试
function test23()
{
    parse="asin1000";
    var result = calculate();
    compare.equal(result,"Out Of Range","wrong");
    clear();
}

function test24()
{
    parse="acos10000";
    var result = calculate();
    compare.equal(result,"Out Of Range","wrong");
    clear();
}

function test25()
{
    parse="ln(-2)";
    var result = calculate();
    compare.equal(result,"Out Of Range","wrong");
    clear();
}
//综合测试
function test26()
{
    parse="-2*-9++4*-2";
    var result = calculate();
    compare.equal(result,10,"wrong");
    clear();
}

function test27()
{
    parse="1---2";
    var result = calculate();
    compare.equal(result,-1,"wrong");
    clear();
}
/*
function test28()
{
    parse="1+1";
    var result = calculate();
    compare.equal(result,6,"wrong");
    clear();
}

function test29()
{
    parse="1+1";
    var result = calculate();
    compare.equal(result,6,"wrong");
    clear();
}
*/

function testAll()
{
    test1();
    test2();
    test3();
    test4();
    test5();
    test6();
    test7();
    test8();
    test9();
    test10();
    test11();
    test12();
    test13();
    test14();
    test15();
    test16();
    test17();
    test18();
    test19();
    test20();
    test21();
    test22();
    test23();
    test24();
    test25();
    test26();
    test27();

}

