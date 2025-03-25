const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();



// games route
// "get" gives us all the games
app.get("/", async (req, res) => {
    const games = await prisma.game.findMany({
        orderBy: { name: 'asc' },
    });
    res.render("games/index", {
        games,
    });
});

// posts the games in the database
app.post("/", async (req, res) => {
    const { name, description, releaseDate, genreId, editorId } = req.body;
    await prisma.game.create({
        data: {
            name,
            description,
            releaseDate,
            genre: {
                connect: { id: parseInt(genreId) }
            },
            editor: {
                connect: { id: parseInt(editorId) }
            }
        }
    });
    res.redirect("/games");
});


// games/new route
// gets all the genres and all the editors to put them on the page "games/new"
app.get('/new', async (req, res) => {
    // to fetch genres and editors (useful for the form)
    const genres = await prisma.genre.findMany();
    const editors = await prisma.editor.findMany();

    res.render("games/new", {
        genres: genres,
        editors: editors
    });
});


// games/id/details route
// get all the details of one game with its id
app.get("/:id/details", async (req, res) => {
    const { id } = req.params;
    const gameId = parseInt(id);

    const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
            genre: true,
            editor: true
        }
    });
    res.render("games/details", { game });
});


// games/id/edit route
// gets all information of one game so we can edit it 
app.get("/:id/edit", async (req, res) => {
    const { id } = req.params;
    const gameId = parseInt(id);

    const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
            genre: true,
            editor: true
        }
    });

    const genres = await prisma.genre.findMany();
    const editors = await prisma.editor.findMany();

    // add selected flags for each genre and editor
    const genresWithSelectedFlag = genres.map(genre => ({
        ...genre,
        isSelected: genre.id === game.genreId
    }));
    const editorsWithSelectedFlag = editors.map(editor => ({
        ...editor,
        isSelected: editor.id === game.editorId
    }));

    res.render("games/edit", {
        game,
        genres: genresWithSelectedFlag,
        editors: editorsWithSelectedFlag
    });
});

// posts the edit in the database and goes back to the detail of the game
app.post("/:id/edit", async (req, res) => {
    const { id } = req.params;
    const { name, description, releaseDate, genreId, editorId } = req.body;

    const gameId = parseInt(id);

    const updatedGame = await prisma.game.update({
        where: { id: gameId },
        data: {
            name,
            description,
            releaseDate,
            genre: {
                connect: { id: parseInt(genreId) }
            },
            editor: {
                connect: { id: parseInt(editorId) }
            }
        }
    });

    res.redirect(`/games/${gameId}/details`);
});


// games/id/updateFeatured route
// posts if the game is featured or not in the database
app.post("/:id/updateFeatured", async (req, res) => {
    const { id } = req.params;
    const gameId = parseInt(id);

    const game = await prisma.game.findUnique({
        where: { id: gameId }
    });

    const updatedGame = await prisma.game.update({
        where: { id: gameId },
        data: { featured: !game.featured }
    });

    res.redirect("/games");
});


// games/id/delete route
// deletes a game
app.post("/:id/delete", async (req, res) => {
    const { id } = req.params;
    await prisma.game.delete({
        where: { id: parseInt(id) },
    });
    res.redirect('/games');
});


module.exports = app;