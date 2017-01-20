define( [
    "../core",
    "../var/support",
    "../ajax"
    //【依赖文件】
], function( jQuery, support ) {

    "use strict"; // 【严格模式】

    jQuery.ajaxSettings.xhr = function() {
        // 【异常捕获】
        try {
            return new window.XMLHttpRequest();
        } catch ( e ) {}
    };
    // 【在JQUery 上定义一个xhr方法 ：返回window的XMLHttpRequest 方法  】

    var xhrSuccessStatus = {
            // File protocol always yields status code 0, assume 200
// 【文件协议总是产生状态码0，假设200】
            0: 200,

            // Support: IE <=9 only
            // #1450: sometimes IE returns 1223 when it should be 204
            1223: 204
        },
        xhrSupported = jQuery.ajaxSettings.xhr();

    support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
    support.ajax = xhrSupported = !!xhrSupported;  // 【两次取反 转为布尔值】

    // 【调用 ajaxTransport 方法  参数是一个匿名函数    -》》返回一个对象 】
    jQuery.ajaxTransport( function( options ) {
        // 【匿名函数的参数是一个对象】

        var callback, errorCallback;

        // Cross domain only allowed if supported through XMLHttpRequest
        // 【如果支持跨域只允许通过XMLHttpRequest】
        if ( support.cors || xhrSupported && !options.crossDomain ) {

            // 【返回对象 具有 send 和 abort 两个属性】
            return {
                send: function( headers, complete ) {
                    // send 有两个参数

                    var i,
                        xhr = options.xhr();
                    //【使用了xhr方法 创建了一个ajax实例】

                    // 【打开地址】
                    xhr.open(
                        options.type,
                        options.url,
                        options.async,
                        options.username,
                        options.password
                    );

                    // Apply custom fields if provided
                    // 【如果有提供的自定义字段 通过for in 遍历传入的对象 】
                    if ( options.xhrFields ) {
                        for ( i in options.xhrFields ) {
                            xhr[ i ] = options.xhrFields[ i ];
                        }
                    }

                    // Override mime type if needed  【如果需要重写的MIME类型】
                    if ( options.mimeType && xhr.overrideMimeType ) {
                        xhr.overrideMimeType( options.mimeType );
                    }

                    // X-Requested-With header
                    // For cross-domain requests, seeing as conditions for a preflight are
                    // akin to a jigsaw puzzle, we simply never set it to be sure.
                    // (it can always be set on a per-request basis or even using ajaxSetup)
                    // For same-domain requests, won't change header if already provided.

                    // 【看不太懂 不过应该是在做跨域问题处理
                    //  是设置请请求头信息？
                    // 】
                    if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
                        headers[ "X-Requested-With" ] = "XMLHttpRequest";
                    }

                    // Set headers
                    //【如果有header  设置请求头】
                    for ( i in headers ) {
                        xhr.setRequestHeader( i, headers[ i ] );
                    }

                    // Callback 【回调函数 参数是类型 返回匿名函数  】
                    callback = function( type ) {
                        return function() {
                            if ( callback ) {
                                callback = errorCallback = xhr.onload =
                                    xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

                                if ( type === "abort" ) {
                                    xhr.abort();
                                } else if ( type === "error" ) {

                                    // Support: IE <=9 only
                                    // On a manual native abort, IE9 throws
                                    // errors on any property access that is not readyState
                                    if ( typeof xhr.status !== "number" ) {
                                        complete( 0, "error" );
                                    } else {
                                        complete(

                                            // File: protocol always yields status 0; see #8605, #14207
                                            xhr.status,
                                            xhr.statusText
                                        );
                                    }
                                } else {
                                    complete(
                                        xhrSuccessStatus[ xhr.status ] || xhr.status,
                                        xhr.statusText,

                                        // Support: IE <=9 only
                                        // IE9 has no XHR2 but throws on binary (trac-11426)
                                        // For XHR2 non-text, let the caller handle it (gh-2498)
                                        ( xhr.responseType || "text" ) !== "text"  ||
                                        typeof xhr.responseText !== "string" ?
                                        { binary: xhr.response } :
                                        { text: xhr.responseText },
                                        xhr.getAllResponseHeaders()
                                    );
                                }
                            }
                        };
                    };

                    // Listen to events
                    xhr.onload = callback();
                    errorCallback = xhr.onerror = callback( "error" );

                    // Support: IE 9 only
                    // Use onreadystatechange to replace onabort
                    // to handle uncaught aborts
                    if ( xhr.onabort !== undefined ) {
                        xhr.onabort = errorCallback;
                    } else {
                        xhr.onreadystatechange = function() {

                            // Check readyState before timeout as it changes
                            if ( xhr.readyState === 4 ) {

                                // Allow onerror to be called first,
                                // but that will not handle a native abort
                                // Also, save errorCallback to a variable
                                // as xhr.onerror cannot be accessed
                                window.setTimeout( function() {
                                    if ( callback ) {
                                        errorCallback();
                                    }
                                } );
                            }
                        };
                    }

                    // Create the abort callback
                    callback = callback( "abort" );

                    try {

                        // Do send the request (this may raise an exception)
                        xhr.send( options.hasContent && options.data || null );
                    } catch ( e ) {

                        // #14683: Only rethrow if this hasn't been notified as an error yet
                        if ( callback ) {
                            throw e;
                        }
                    }
                },

                // 【如果cb存在 执行cb】
                abort: function() {
                    if ( callback ) {
                        callback();
                    }
                }
            };
        }
    } );

} );