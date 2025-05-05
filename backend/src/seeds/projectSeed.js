const fs = require('fs');
const path = require('path');
const { Project, User, Issue, Comment, IssueUser } = require('../models');

/**
 * Script para carregar dados iniciais do projeto a partir do arquivo example-project.json
 * Este script pode ser executado manualmente ou como parte da inicialização do banco de dados
 */
async function seedProjectData() {
  try {
    console.log('Iniciando carregamento de dados do projeto...');
    
    // Caminho para o arquivo example-project.json no backend
    const projectJsonPath = path.join(__dirname, '../data/example-project.json');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(projectJsonPath)) {
      console.error('Arquivo example-project.json não encontrado em:', projectJsonPath);
      return;
    }
    
    // Ler e parsear o arquivo JSON
    const projectData = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
    
    // Verificar se já existe um projeto com este ID
    const existingProject = await Project.findByPk(projectData.id);
    if (existingProject) {
      console.log(`Projeto com ID ${projectData.id} já existe. Pulando criação.`);
    } else {
      // Criar o projeto
      await Project.create({
        id: projectData.id,
        name: projectData.name,
        url: projectData.url,
        description: projectData.description,
        category: projectData.category,
        createdAt: projectData.createdAt,
        updatedAt: projectData.updatedAt
      });
      console.log(`Projeto ${projectData.name} criado com sucesso.`);
    }
    
    // Processar usuários
    for (const userData of projectData.users) {
      const existingUser = await User.findByPk(userData.id);
      if (existingUser) {
        console.log(`Usuário ${userData.name} já existe. Pulando criação.`);
      } else {
        // Criar o usuário com um email fictício baseado no nome
        await User.create({
          id: userData.id,
          name: userData.name,
          email: `${userData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          avatarUrl: userData.avatarUrl,
          createdAt: projectData.createdAt,
          updatedAt: projectData.updatedAt
        });
        console.log(`Usuário ${userData.name} criado com sucesso.`);
      }
    }
    
    // Processar issues
    for (const issueData of projectData.issues) {
      const existingIssue = await Issue.findByPk(issueData.id);
      if (existingIssue) {
        console.log(`Issue ${issueData.title} já existe. Pulando criação.`);
      } else {
        // Criar a issue
        await Issue.create({
          id: issueData.id,
          title: issueData.title,
          type: issueData.type,
          status: issueData.status,
          priority: issueData.priority,
          listPosition: issueData.listPosition,
          description: issueData.description,
          reporterId: issueData.reporterId,
          projectId: projectData.id,
          createdAt: issueData.createdAt || projectData.createdAt,
          updatedAt: issueData.updatedAt || projectData.updatedAt
        });
        console.log(`Issue ${issueData.title} criada com sucesso.`);
        
        // Processar assignees (userIds)
        if (issueData.userIds && issueData.userIds.length > 0) {
          for (const userId of issueData.userIds) {
            await IssueUser.create({
              issueId: issueData.id,
              userId: userId,
              createdAt: issueData.createdAt || projectData.createdAt,
              updatedAt: issueData.updatedAt || projectData.updatedAt
            });
          }
          console.log(`Assignees para issue ${issueData.title} criados com sucesso.`);
        }
        
        // Processar comentários se existirem
        if (issueData.comments && issueData.comments.length > 0) {
          for (const commentData of issueData.comments) {
            await Comment.create({
              id: commentData.id,
              body: commentData.body,
              issueId: issueData.id,
              userId: commentData.userId,
              createdAt: commentData.createdAt || issueData.createdAt || projectData.createdAt,
              updatedAt: commentData.updatedAt || issueData.updatedAt || projectData.updatedAt
            });
          }
          console.log(`Comentários para issue ${issueData.title} criados com sucesso.`);
        }
      }
    }
    
    console.log('Carregamento de dados do projeto concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao carregar dados do projeto:', error);
  }
}

// Exportar a função para uso em outros arquivos
module.exports = seedProjectData;

// Se este arquivo for executado diretamente, executar o seed
if (require.main === module) {
  seedProjectData()
    .then(() => {
      console.log('Script de seed finalizado.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erro no script de seed:', error);
      process.exit(1);
    });
}
