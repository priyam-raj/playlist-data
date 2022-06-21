//to check input URL is valid or not
function is_url(myURL) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + //port
        '(\\?[;&amp;a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i');
    return pattern.test(myURL);
}
//to check if input url contains "list=" or not
function list_check(a, b, c, d, e) {
    if (a == 'l' && b == 'i' && c == 's' && d == 't' && e == '=') {
        return true;
    }
    else {
        return false;
    }
}
function is_playlist_url(str) {
    if (str[str.length - 1] == '/') {
        str = str.slice(0, str.length - 1)
    }
    var i = 0, low = -1, high = -1, ans = "NULL";
    if (!is_url(str)) {
        return ans;
    }
    while (i <= 5000) {
        if (list_check(str[i], str[i + 1], str[i + 2], str[i + 3], str[i + 4])) {
            low = i + 5;
            break;
        }
        i++;
    }
    if (low != -1) {
        high = str.length;
        ans = str.slice(low, high);
    }
    return ans;
}


//test cases
var str1 = "https://youtube.com/playlist?list=PLMC9KNkIncKseYxDN2niH6glGRWKsLtde/";
var str2 = "https://youtube.com/playlist?list=PL9bw4S5ePsEEqCMJSiYZ-KTtEjzVy0YvK";
var str3 = "2173123181913264#@&^#%!&@";
var str4 = "var str3 =2173123181913264#@&^#%!&@";
var str5 = "https://youtube.com/playlist?list=PLkF7RYTIPWdc6kLduyH0-Kp-vbCzX91tG"
var str6 = "list=PLkF7RYTIPWdc6kLduyH0-Kp-vbCzX91tG"
var str7 = "https://youtube.com/playlist?list=PL9oy3ot40bw4S5ePsEEqCMJSiYZ-KTtEjzVy0YvK"

//operations
//returns "NULL" the link is not valid otherwise returns Playlist Id
console.log(is_playlist_url(str1));
console.log(is_playlist_url(str2));
console.log(is_playlist_url(str3));
console.log(is_playlist_url(str4));
console.log(is_playlist_url(str5));
console.log(is_playlist_url(str6));
console.log(is_playlist_url(str7));



