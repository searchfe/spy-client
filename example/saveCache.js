/**
 * @file saveCache.js
 * @author chaiyanchen(chaiyanchen@baidu.com)
 * 起一个简单的本地服务，可用于接收spy-local-cache中缓存的数据
 */

const fs = require('fs');

const fastify = require('fastify')({
    logger: true,
});

fastify.register(require('fastify-cors'), {});

// 声明路由
fastify.post('/saveData', function (request, reply) {
    try {
        const jsonData = JSON.stringify(request.body);
        const filePath = `jsonData_${new Date().getTime()}.json`;
        fs.writeFile(filePath, jsonData, 'utf8', err => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('写入成功！');
        });
    }
    catch (error) {
        console.log('写入失败:', error);
    }

    reply.send({hello: 'world'});
});

fastify.listen(3000, function (err, address) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`);
});
