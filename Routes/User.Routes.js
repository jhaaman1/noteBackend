import { User } from "../models/UserModel.js";

export const UserRoutes = (app) => {
  app.post("/api/users", async (req, res) => {
    try {
      const { user } = req.body;
      console.log("Received user:", user);

      if (!user) {
        throw { code: 400, message: "Field is required" };
      }
      const createdAt = new Date();
      const todo = new User({ user, createdAt });
      await todo.save();
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error(error);
      res.status(error.code || 500).json({ error: error.message || "Internal Server Error" });
    }
  });


  app.get("/api/getUser", async (req, res) => {
    const ITEMS_PER_PAGE = 5;
    const page = parseInt(req.query.page) || 1;
    try {
      let userId = req.body.userId;
      let searchQuery = req.query.search || '';
      let allUsers = await User.find({ userId }).exec();
      let filteredUsers = allUsers.filter(user => {
        return user.user.toLowerCase().includes(searchQuery.toLowerCase());
      });

      filteredUsers = filteredUsers.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);

        return dateB - dateA;
      });

      const totalCount = filteredUsers.length;
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

      const paginatedData = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);


      res.status(200).json({
        data: paginatedData,
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount
      });

    } catch (error) {
      console.error(error);
      res.status(error.code || 404).send({ message: error.message });
    }
  });

  app.delete("/delete/:todoId", async (req, res) => {
    const { todoId } = req.params;
    const deleteNote = await User.findByIdAndDelete({
      _id: todoId,
      userId: req.body.todoId,
    });
    if (deleteNote) {
      res.send("Note deleted successfully");
    } else {
      res.send("cant delete");
    }
  });

  app.patch("/edit/:todoId", async (req, res) => {
    const { todoId } = req.params;
    const updatedNote = await User.findOneAndUpdate(
      { _id: todoId, userId: req.body.todoId },
      { ...req.body }
    );
    if (updatedNote) {
      res.send("updated");
    } else {
      res.send("unable to update");
    }
  });

  app.post("/api/clone/:todoId", async (req, res) => {
    const { todoId } = req.params;

    try {
      const originalNote = await User.findById(todoId);
      console.log('orig', originalNote)
      if (!originalNote) {
        throw { code: 404, message: "Note not found" };
      }

      const clonedNote = new User({
        userId: originalNote._id,
        user: originalNote.user,
        createdAt: new Date()
      });
      await clonedNote.save();

      res.status(201).json({ message: "Note cloned successfully", clonedNote });
    } catch (error) {
      console.error(error);
      res.status(error.code || 500).json({ error: error.message || "Internal Server Error" });
    }
  });
};
