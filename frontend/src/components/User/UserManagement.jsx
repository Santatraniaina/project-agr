import React, { useState, useEffect, useCallback } from 'react';
import UserList from './UserList';
import AddUserForm from './AddUserForm';
import EditUserForm from './EditUserForm';
import Sidebar from '../Sidebar';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  
  const fetchUsers = useCallback(async () => { 
    try {
      const response = await axios.get('http://localhost:8000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs :", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); 


  const handleAddUser = (newUser) => {
    setUsers([...users, newUser]);
    setShowAddForm(false);
  };

  const handleEditUser = (updatedUser) => {
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    setShowEditForm(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
  
    try {
      // Étape 1 : Obtenir le cookie CSRF via Sanctum
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      
      const csrfToken = csrfResponse.data.csrfToken;
  
  
      // Étape 2 : Envoyer la requête DELETE
      const response = await axios.delete(`http://localhost:8000/api/users/${userId}`, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
      );
      fetchUsers();
  
      // Étape 3 : Mise à jour de l’interface
      if (response.status === 200 || response.status === 204) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } else {
        console.error("Erreur lors de la suppression");
        alert("La suppression a échoué !");
      }
  
    } catch (error) {
      console.error("Erreur réseau :", error.response?.data || error.message);
      alert("Une erreur est survenue !");
    }
  };
  
  

  return (
    <div className="container mx-auto px-4 py-8">
      <Sidebar />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-red-800">Gestion des Utilisateurs</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Nouvel Utilisateur
        </button>
      </div>

      <UserList 
        users={users}
        onEdit={(user) => {
          setSelectedUser(user);
          setShowEditForm(true);
        }}
        onDelete={handleDeleteUser}
      />

      {showAddForm && (
        <AddUserForm 
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddUser}
          refreshUsers = {fetchUsers}
        />
      )}

      {showEditForm && selectedUser && (
        <EditUserForm 
          user={selectedUser}
          onClose={() => setShowEditForm(false)}
          onSubmit={handleEditUser}
        />
      )}
    </div>
  );
};

export default UserManagement;