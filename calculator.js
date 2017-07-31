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
            if (if_buffer)
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
                return Array("l", 0);
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
    if (a==1)
        return 1;
    if (a<0)
        throw "PositiveExpected";
    if (a%1!=0)
        throw "intExpected";
    return intRank(a - 1)*a;
}
function primary() {//primary的实现细节
    var t = get();
    switch (t[0]) {
        case  8://数字与阶乘
            var l = get();
            if (l[0] == '!')
                return intRank(t[1]);
            if (l[0] == '^')
            {
                var temp_left = primary();
                return Math.pow(t[1], temp_left);
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
            try {
                return Math.asin(left);
            }
            catch(str) {
                throw "Out Of Range";
            }
        }
        case'x':
        {
            var left = primary();
            try {
                return Math.acos(left);
            }
            catch(str) {
                throw "Out Of Range";
            }
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
                var temp = primary();;
                if (temp%1!=0||left%1!=0)throw "DivisionInt";//error("% right expected a int");
                //if (t != left)throw "DivisionInt";//error("% left expected a int");
                if (temp == 0)throw "ZeroDivision";//error("0 division erro");
                left = left%temp;
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
        var left = expression();
        if (isNaN(left)||!isFinite(left))
            return "Out Of Range";
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
    if (str==="=") {
        parse=document.getElementById("txt_display").value;
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
