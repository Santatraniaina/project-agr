import React, { useState } from 'react';

const UserPermission = ({ users, onUpdatePermissions }) => {
  const [permissions, setPermissions] = useState({});

  const handlePermissionChange = (userId, permission) => {
    setPermissions({
      ...permissions,
      [userId]: {
        ...permissions[userId],
        [permission]: !permissions[userId]?.[permission],
      },
    });
  };

  const handleSubmit = () => {
    onUpdatePermissions(permissions);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Gestion des Permissions</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Nom d'utilisateur</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Email</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Admin</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">PE</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Caissier</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 border-b border-gray-500">{user.name}</td>
              <td className="px-6 py-4 border-b border-gray-500">{user.email}</td>
              <td className="px-6 py-4 border-b border-gray-500">
                <input
                  type="checkbox"
                  checked={permissions[user.id]?.Admin || false}
                  onChange={() => handlePermissionChange(user.id, 'Admin')}
                />
              </td>
              <td className="px-6 py-4 border-b border-gray-500">
                <input
                  type="checkbox"
                  checked={permissions[user.id]?.PE || false}
                  onChange={() => handlePermissionChange(user.id, 'PE')}
                />
              </td>
              <td className="px-6 py-4 border-b border-gray-500">
                <input
                  type="checkbox"
                  checked={permissions[user.id]?.Caissier || false}
                  onChange={() => handlePermissionChange(user.id, 'Caissier')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Enregistrer les Modifications
        </button>
      </div>
    </div>
  );
};

export default UserPermission;