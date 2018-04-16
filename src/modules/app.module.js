/**
 * 基础通用module
 * **/

const App = {
    namespaced: true,
    state: {
        userinfo: null,
    },
    actions: {
        /** 获取文章配置 **/
        async getUserinfo(context, payload) {
            try {
                const url = `#`;
                const msg = await server(url, null, "GET");
                if (msg.status === 200 || msg.status === 304) {
                    context.commit({
                        type: "saveUserinfo",
                        data: msg.data
                    });
                }
                return msg;
            } catch (e) {
                console.log("网络出现错误，配置获取失败");
            }
        },
    },
    mutations: {
        saveUserinfo(state, payload) {
            // 保存文章列表
            state.userinfo = payload.data;
        },
    }
};

export default App;
