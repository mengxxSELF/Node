/* 基础版 ajax */
// 创建 打开地址   监听 发送

function ajax(opt){
    // 默认值设置
    var def = {
        type:'get',
        url:null,
        async:true,
        data:null,
        dataType:'text',
        success:null
    };
    //参数解析 ： 请求类型  请求地址  是否异步  请求体  响应数据格式   函数
    for(var attr in opt){
        // 判断是否是
        if(attr instanceof  opt){
            def[attr]=opt[attr];
        }
    }


    var xhr = new XMLHttpRequest();
    xhr.open(def.type,def.url,def.async);
    xhr.onreadystatechange= function () {
        if(xhr.readyState=4 && xhr.status==200){
            var val = xhr.responseText;
            // 处理数据格式
            switch (def.dataType){
                case 'XML':
                    val = xhr.responseXML;
                    break;
                case 'json':
                    val=  'JSON' in window?JSON.parse(val):eval('('+val+')');
                    break; // 处理json 注意兼容问题
            }

            def.success && def.success.call(this,val);
        }
    };
    xhr.send(def.data);


}