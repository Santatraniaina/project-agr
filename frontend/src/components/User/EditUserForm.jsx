import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditUserForm = ({ user, onSubmit, onClose }) => {
  const [name, setname] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  useEffect(() => {
    setname(user.name);
    setEmail(user.email);
    setRole(user.role);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      const csrfToken = csrfResponse.data.csrfToken;
      await axios.put(`/users/${user.id}`, { name, email, role },
        {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      onSubmit(); // Call onSubmit to update the user list
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Modifier l'Utilisateur</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setname(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            >
              <option value="Admin">Admin</option>
              <option value="PE">PE</option>
              <option value="Caissier">Caissier</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserForm;