const express = require("express");
const router = express.Router();
const connection = require("../db");
const moment = require("moment");

// GET http://localhost:3000/api/budgets
router.get("/budgets", (req, res) => {
  const { skip = 0, take = 10 } = req.query;

  const totalQuery = "SELECT COUNT(*) AS totalCount FROM budgets";
  const dataQuery = "SELECT * FROM budgets LIMIT ? OFFSET ?";

  connection.query(totalQuery, (error, totalResult) => {
    if (error) {
      return res
        .status(500)
        .json({ error: "Failed to retrieve budgets count" });
    }

    const totalCount = totalResult[0].totalCount;

    connection.query(
      dataQuery,
      [parseInt(take), parseInt(skip)],
      (error, results) => {
        if (error) {
          return res.status(500).json({ error: "Failed to retrieve budgets" });
        }

        res.status(200).json({
          data: results,
          totalCount: totalCount,
        });
      }
    );
  });
});

// POST http://localhost:3000/api/budgets
router.post("/budgets", (req, res) => {
  const {
    user_id,
    title,
    category,
    total_amount,
    remarks,
    created_at,
    updated_at,
    start_date,
    end_date,
  } = req.body;

  const formattedCreatedAt = created_at
    ? moment(created_at).format("YYYY-MM-DD HH:mm:ss")
    : null;
  const formattedUpdatedAt = updated_at
    ? moment(updated_at).format("YYYY-MM-DD HH:mm:ss")
    : null;
  const formattedStartDate = start_date
    ? moment(start_date).format("YYYY-MM-DD")
    : null;
  const formattedEndDate = end_date
    ? moment(end_date).format("YYYY-MM-DD")
    : null;

  const query =
    "INSERT INTO budgets (user_id, title, category, total_amount, remarks, created_at, updated_at, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  connection.query(
    query,
    [
      user_id || null,
      title,
      category,
      total_amount,
      remarks,
      formattedCreatedAt,
      formattedUpdatedAt,
      formattedStartDate,
      formattedEndDate,
    ],
    (error, results) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.status(201).send({ id: results.insertId, ...req.body });
    }
  );
});

// GET http://localhost:3000/api/budgets/id
router.get("/budgets/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM budgets WHERE id = ?";
  connection.query(query, [id], (error, results) => {
    if (error) {
      return res.status(500).send(error);
    }
    if (results.length === 0) {
      return res.status(404).send({ message: "Budgets not found" });
    }
    res.status(200).send(results[0]);
  });
});

// PATCH http://localhost:3000/api/budgets/id
router.patch("/budgets/:id", (req, res) => {
  const { id } = req.params;
  const {
    title,
    category,
    total_amount,
    remarks,
    updated_at,
    start_date,
    end_date,
  } = req.body;

  let query = "UPDATE budgets SET ";
  const updates = [];
  const values = [];

  if (title !== undefined) {
    updates.push("title = ?");
    values.push(title);
  }
  if (category !== undefined) {
    updates.push("category = ?");
    values.push(category);
  }
  if (total_amount !== undefined) {
    updates.push("total_amount = ?");
    values.push(total_amount);
  }
  if (remarks !== undefined) {
    updates.push("remarks = ?");
    values.push(remarks);
  }
  if (updated_at !== undefined) {
    updates.push("updated_at = ?");
    values.push(updated_at.split(".")[0]);
  }
  if (start_date !== undefined) {
    updates.push("start_date = ?");
    values.push(start_date.split(".")[0]);
  }
  if (end_date !== undefined) {
    updates.push("end_date = ?");
    values.push(end_date.split(".")[0]);
  }

  query += updates.join(", ") + " WHERE id = ?";
  values.push(id);

  connection.query(query, values, (error, results) => {
    if (error) {
      return res.status(500).send(error);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send({ message: "Budget not found" });
    }
    res.status(200).send({
      id,
      title,
      category,
      total_amount,
      remarks,
      updated_at,
      start_date,
      end_date,
    });
  });
});

// DELETE http://localhost:3000/api/budgets/id
router.delete("/budgets/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM budgets WHERE id = ?";
  connection.query(query, [id], (error, results) => {
    if (error) {
      return res.status(500).send(error);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send({ message: "Budget not found" });
    }
    res.status(200).send({ message: "Budget deleted" });
  });
});

module.exports = router;
