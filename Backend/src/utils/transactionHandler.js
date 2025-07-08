// utils/transactionHandler.js
//Funcion utilitaria para el manejo de transacciones
const sequelize = require('../../config/db');

const handleTransaction = async (res, callback) => {
  const transaction = await sequelize.transaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = handleTransaction;