pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins/jenkins-jenkins-agent: 'true'
    jenkins/label: 'main-pipeline_main'
spec:
  containers:
    - name: maven
      image: maven:alpine
      command:
        - cat
      tty: true
    - name: python
      image: python:3.9-alpine
      command:
        - cat
      tty: true
    - name: ez-docker-helm-build
      image: ezezeasy/ez-docker-helm-build:1.41
      imagePullPolicy: Always
      securityContext:
        privileged: true
    - name: jnlp
      image: jenkins/inbound-agent:3248.v65ecb_254c298-2
      env:
        - name: JENKINS_SECRET
          value: '********'
        - name: JENKINS_TUNNEL
          value: 'jenkins-agent.jenkins.svc.cluster.local:50000'
        - name: JENKINS_AGENT_NAME
          value: 'main-pipeline-main'
        - name: REMOTING_OPTS
          value: '-noReconnectAfter 1d'
        - name: JENKINS_NAME
          value: 'main-pipeline-main'
        - name: JENKINS_AGENT_WORKDIR
          value: '/home/jenkins/agent'
        - name: JENKINS_URL
          value: 'http://jenkins.jenkins.svc.cluster.local:8080/'
      resources:
        requests:
          memory: '256Mi'
          cpu: '100m'
  volumes:
    - name: workspace-volume
      emptyDir: {}
"""
        }
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], userRemoteConfigs: [[url: 'https://github.com/learn11/sela-project.git']]])
            }
        }

        stage('Wait for MongoDB') {
            steps {
                container('python') {
                    script {
                        sh 'while ! nc -z mongodb.default.svc.cluster.local 27017; do echo "Waiting for MongoDB..."; sleep 1; done; echo "MongoDB is running!"'
                    }
                }
            }
        }

        stage('Run Python Tests') {
            steps {
                container('python') {
                    script {
                        if (fileExists('requirements.txt')) {
                            sh 'pip install -r requirements.txt'
                        }
                        sh 'pytest'
                    }
                }
            }
        }

        stage('Build and Push Docker Images') {
            steps {
                container('ez-docker-helm-build') {
                    script {
                        // Assuming you have a Dockerfile in your repository
                        sh 'docker build -t your-image-name .'
                        sh 'docker login -u your-username -p your-password'
                        sh 'docker push your-image-name'
                    }
                }
            }
        }
    }

    post {
        always {
            emailext(
                to: 'edmonp173@gmail.com',
                subject: "Jenkins Build: ${currentBuild.fullDisplayName}",
                body: """<p>Build ${currentBuild.fullDisplayName} completed with status ${currentBuild.result}.</p>
                         <p>Check console output at ${env.BUILD_URL} to view the results.</p>"""
            )
        }
    }
}
