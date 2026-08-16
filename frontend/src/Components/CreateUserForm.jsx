import React, { useState } from "react";
import { createUser } from "../services/api.js";

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createUser(formData); // Call the API utility function
      setSuccessMessage(`User created successfully: ${response.username}`);
      setFormData({ username: "", email: "" }); // Reset form
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div>
      <h1>Create User</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <button type="submit">Create User</button>
      </form>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default CreateUserForm;
