const request = require('supertest'); // accès HTTP
const app = require('./server');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


afterAll(async () => {
  await prisma.$disconnect();
});

describe('Test des routes de jeux', () => {

  it('devrait récupérer tous les jeux', async () => {
    const response = await request(app).get('/games');
    expect(response.status).toBe(200);
  });

  it('devrait récupérer un jeu spécifique', async () => {
    // récupère un jeu déjà présent dans la base
    const gameInDb = await prisma.game.findFirst();
    const gameId = gameInDb.id;

    const response = await request(app).get(`/games/${gameId}/details`);
    expect(response.status).toBe(200);
  });

  it('devrait supprimer un jeu', async () => {
    // sélectionne un jeu déjà présent dans la base de données
    const gameInDb = await prisma.game.findFirst();

    if (!gameInDb) {
      throw new Error("Aucun jeu trouvé dans la base de données pour le test.");
    }

    const gameId = gameInDb.id;

    const response = await request(app).post(`/games/${gameId}/delete`);
    expect(response.status).toBe(302); //302

    // vérifie que le jeu a été supprimé
    const deletedGame = await prisma.game.findUnique({
      where: { id: gameId },
    });
    expect(deletedGame).toBeNull();
  });

});
