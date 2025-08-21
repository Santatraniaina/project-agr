import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AddUserForm = ({ onSubmit, onClose, refreshUsers }) => {
  const [name, setname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Admin');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  
  
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      
      const userData = {
        name,
        email,
        password,
        role: role.toLowerCase() // Convertir en minuscules
      };
  
      const response = await axios.post('http://localhost:8000/api/users', userData, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfResponse.data.csrfToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      
      refreshUsers();
      onClose();
    } catch (error) {
      console.error('Error adding user:', error.response?.data || error.message);
    }};

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Ajouter un Utilisateur</h2>
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
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
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;