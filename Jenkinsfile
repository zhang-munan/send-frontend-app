pipeline {
    agent any

    environment {
        PATH        = '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'
        IMAGE_NAME  = 'bangni-h5'
        IMAGE_TAG   = "v${BUILD_NUMBER}"
        SERVER_IP   = '124.222.204.121'
        SERVER_USER = 'deploy'
        DEPLOY_DIR  = '/opt/apps/bangni-shuochukou'
        BUILD_DIR   = '/opt/apps/bangni-shuochukou/build-h5'
    }

    stages {
        stage('Checkout') {
            steps {
                git credentialsId: 'ghcr-credentials',
                    url: 'https://github.com/zhang-munan/send-frontend-app.git',
                    branch: 'release/0.x'
            }
        }

        stage('Sync to Server') {
            steps {
                sshagent(credentials: ['server-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} 'mkdir -p ${BUILD_DIR}'
                    """
                    sh """
                        rsync -az --delete \
                            --exclude='.git' \
                            --exclude='node_modules' \
                            -e 'ssh -o StrictHostKeyChecking=no' \
                            ./ ${SERVER_USER}@${SERVER_IP}:${BUILD_DIR}/
                    """
                }
            }
        }

        stage('Build & Deploy on Server') {
            steps {
                sshagent(credentials: ['server-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} '
                            cd ${BUILD_DIR} &&
                            docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -f Dockerfile.h5 . &&
                            cd ${DEPLOY_DIR} &&
                            sed -i "s|^H5_IMAGE=.*|H5_IMAGE=${IMAGE_NAME}:${IMAGE_TAG}|" .env.production &&
                            docker compose --env-file .env.production -f compose.yml up -d h5 &&
                            echo "✅ 构建部署完成: ${IMAGE_NAME}:${IMAGE_TAG}"
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ H5 部署成功！镜像: ${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo "❌ H5 部署失败，请检查日志"
        }
    }
}
