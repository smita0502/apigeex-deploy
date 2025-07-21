var goodHeaders = [
    'Content-Length',
    'Date',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Origin',
    'Access-Control-Max-Age',
    'Access-Control-Allow-Credentials',
    'Content-Type'
];

function removeHeaders(context, goodHeaders) {
    // get the list of headers in a JS array
    var headers = context.getVariable('response.headers.names');
    headers = headers.toString().replace('[', '').replace(']','')
        .replace(' ', '')
        .split(',').map(String);

    for (i = 0; i < headers.length; i++) {
        var name = headers[i].trim();
        if (goodHeaders.indexOf(name.trim()) < 0) {
            context.removeVariable("response.header." + name );
        }
    }
}

// Call the Script
removeHeaders(context, goodHeaders);
