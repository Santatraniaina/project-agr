import React from 'react';
import { FaUserEdit, FaUserLock } from 'react-icons/fa';



const UserList = ({ users = [], onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left">Nom d'utilisateur</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Rôle</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
          {Array.isArray(users) && users.length > 0 ? (
  users.filter(user =>user && (user.id || user.id)).map((user) => (
    <tr key={user.id || user._id} className="border-b">
      <td className="px-6 py-4">{user.name || "N/A"}</td>
      <td className="px-6 py-4">{user.email || "N/A"}</td>
      <td className="px-6 py-4">{user.role || "N/A"}</td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(user)}
            className="p-2 text-green-500 hover:text-green-600"
            title="Modifier"
          >
            <FaUserEdit />
          </button>
          <button 
            onClick={() => onDelete(user.id || user._id)}
            className="p-2 text-red-500 hover:text-red-600"
            title="Supprimer"
          >
            <FaUserLock />
          </button>
        </div>
      </td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="4" className="text-center py-4">
      Aucun utilisateur trouvé
    </td>
  </tr>
)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;