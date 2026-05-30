const pool = require('../config/db');

const {

  getTransactionByUser,

} = require('../models/transactionModel');

const INCOME_TYPE = 'Pemasukan';
const EXPENSE_TYPE = 'Pengeluaran';

const getBalanceDelta = (
  transaction_type,
  amount
) => {

  const numericAmount =
    Number(amount);

  if (
    transaction_type ===
    INCOME_TYPE
  ) {

    return numericAmount;

  }

  if (
    transaction_type ===
    EXPENSE_TYPE
  ) {

    return -numericAmount;

  }

  return null;

};

const validateTransactionInput = (
  transaction_type,
  amount
) => {

  const numericAmount =
    Number(amount);

  if (
    getBalanceDelta(
      transaction_type,
      numericAmount
    ) === null
  ) {

    return 'Jenis transaksi tidak valid';

  }

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {

    return 'Amount harus lebih dari 0';

  }

  return null;

};

const lockWallets = async (
  client,
  walletIds
) => {

  const uniqueWalletIds =
    [...new Set(walletIds)];

  const result =
    await client.query(

      `
      SELECT id_wallet, balance
      FROM wallet
      WHERE id_wallet = ANY($1::uuid[])
      ORDER BY id_wallet
      FOR UPDATE
      `,

      [uniqueWalletIds]

    );

  if (
    result.rows.length !==
    uniqueWalletIds.length
  ) {

    return null;

  }

  return new Map(
    result.rows.map((wallet) => [
      wallet.id_wallet,
      Number(wallet.balance)
    ])
  );

};

const updateWalletBalance = async (
  client,
  id_wallet,
  delta
) => {

  await client.query(

    `
    UPDATE wallet
    SET balance = balance + $1
    WHERE id_wallet = $2
    `,

    [delta, id_wallet]

  );

};

/* =========================
   CREATE TRANSACTION
========================= */

const addTransaction =
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const {

        id_user,
        id_wallet,
        id_category,
        id_budget,
        transaction_type,
        amount,
        description,
        transaction_date,
        source

      } = req.body;

      const validationError =
        validateTransactionInput(
          transaction_type,
          amount
        );

      if (validationError) {

        return res.status(400)
          .json({

            message:
              validationError

          });

      }

      await client.query('BEGIN');

      const walletMap =
        await lockWallets(
          client,
          [id_wallet]
        );

      if (!walletMap) {

        await client.query('ROLLBACK');

        return res.status(404)
          .json({

            message:
              'Wallet tidak ditemukan'

          });

      }

      const delta =
        getBalanceDelta(
          transaction_type,
          amount
        );

      if (
        walletMap.get(id_wallet) +
        delta <
        0
      ) {

        await client.query('ROLLBACK');

        return res.status(400)
          .json({

            message:
              'Saldo wallet tidak cukup'

          });

      }

      /* =========================
         CREATE TRANSACTION
      ========================= */

      await client.query(

        `
        INSERT INTO transactions
        (
          id_user,
          id_wallet,
          id_category,
          id_budget,
          transaction_type,
          amount,
          description,
          transaction_date,
          source
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        `,

        [
          id_user,
          id_wallet,
          id_category,
          id_budget,
          transaction_type,
          amount,
          description,
          transaction_date,
          source
        ]

      );

      await updateWalletBalance(
        client,
        id_wallet,
        delta
      );

      await client.query('COMMIT');

      res.json({

        message:
          'Transaction berhasil ditambahkan'

      });

    } catch (error) {

      await client.query('ROLLBACK');

      console.log(error);

      res.status(500).json({

        message:
          'Server Error'

      });

    }

    finally {

      client.release();

    }

};

/* =========================
   GET TRANSACTION
========================= */

const getTransaction =
  async (req, res) => {

    try {

      const { id_user } =
        req.params;

      const result =
        await getTransactionByUser(
          id_user
        );

      res.json(result.rows);

    } catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          'Server Error'

      });

    }

};

/* =========================
   UPDATE TRANSACTION
========================= */

const editTransaction =
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const {
        id_transaction
      } = req.params;

      const {

        id_wallet,
        id_category,
        transaction_type,
        amount,
        description,
        transaction_date

      } = req.body;

      const validationError =
        validateTransactionInput(
          transaction_type,
          amount
        );

      if (validationError) {

        return res.status(400)
          .json({

            message:
              validationError

          });

      }

      await client.query('BEGIN');

      const transactionResult =
        await client.query(

          `
          SELECT *
          FROM transactions
          WHERE id_transaction = $1
          FOR UPDATE
          `,

          [id_transaction]

        );

      const oldTransaction =
        transactionResult.rows[0];

      if (!oldTransaction) {

        await client.query('ROLLBACK');

        return res.status(404)
          .json({

            message:
              'Transaction tidak ditemukan'

          });

      }

      const walletMap =
        await lockWallets(
          client,
          [
            oldTransaction.id_wallet,
            id_wallet
          ]
        );

      if (!walletMap) {

        await client.query('ROLLBACK');

        return res.status(404)
          .json({

            message:
              'Wallet tidak ditemukan'

          });

      }

      const oldDelta =
        getBalanceDelta(
          oldTransaction.transaction_type,
          oldTransaction.amount
        );

      const newDelta =
        getBalanceDelta(
          transaction_type,
          amount
        );

      const balanceChanges =
        new Map();

      balanceChanges.set(
        oldTransaction.id_wallet,
        (balanceChanges.get(
          oldTransaction.id_wallet
        ) || 0) - oldDelta
      );

      balanceChanges.set(
        id_wallet,
        (balanceChanges.get(id_wallet) || 0) +
        newDelta
      );

      for (const [
  walletId,
  delta
] of balanceChanges) {

  const currentBalance =
    walletMap.get(walletId);

  if (
    currentBalance + delta < 0
  ) {

    await client.query(
      'ROLLBACK'
    );

    return res.status(400)
      .json({

        message:
          'Saldo wallet tidak cukup'

      });

  }

}

      for (const [
        walletId,
        delta
      ] of balanceChanges) {

        await updateWalletBalance(
          client,
          walletId,
          delta
        );

      }

      await client.query(

        `
        UPDATE transactions
        SET

          id_wallet = $1,
          id_category = $2,
          transaction_type = $3,
          amount = $4,
          description = $5,
          transaction_date = $6

        WHERE id_transaction = $7
        `,

        [
          id_wallet,
          id_category,
          transaction_type,
          amount,
          description,
          transaction_date,
          id_transaction
        ]

      );

      await client.query('COMMIT');

      res.json({

        message:
          'Transaction berhasil diupdate'

      });

    } catch (error) {

      await client.query('ROLLBACK');

      console.log(error);

      res.status(500).json({

        message:
          'Server Error'

      });

    }

    finally {

      client.release();

    }

};

/* =========================
   DELETE TRANSACTION
========================= */

const removeTransaction =
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const { id_transaction } =
        req.params;

      /* =========================
         GET TRANSACTION
      ========================= */

      await client.query('BEGIN');

      const transactionResult =
        await client.query(

          `
          SELECT *
          FROM transactions
          WHERE id_transaction = $1
          FOR UPDATE
          `,

          [id_transaction]

        );

      const transaction =
        transactionResult.rows[0];

      if (!transaction) {

        await client.query('ROLLBACK');

        return res.status(404)
          .json({

            message:
              'Transaction tidak ditemukan'

          });

      }

      const walletMap =
        await lockWallets(
          client,
          [transaction.id_wallet]
        );

      if (!walletMap) {

        await client.query('ROLLBACK');

        return res.status(404)
          .json({

            message:
              'Wallet tidak ditemukan'

          });

      }

      /* =========================
         RETURN WALLET BALANCE
      ========================= */

      const rollbackDelta =
        -getBalanceDelta(
          transaction.transaction_type,
          transaction.amount
        );

      if (
        walletMap.get(transaction.id_wallet) +
        rollbackDelta <
        0
      ) {

        await client.query('ROLLBACK');

        return res.status(400)
          .json({

            message:
              'Saldo wallet tidak cukup'

          });

      }

      await updateWalletBalance(
        client,
        transaction.id_wallet,
        rollbackDelta
      );

      /* =========================
         DELETE TRANSACTION
      ========================= */

      await client.query(

        `
        DELETE FROM transactions
        WHERE id_transaction = $1
        `,

        [id_transaction]

      );

      await client.query('COMMIT');

      res.json({

        message:
          'Transaction berhasil dihapus'

      });

    } catch (error) {

      await client.query('ROLLBACK');

      console.log(error);

      res.status(500).json({

        message:
          'Server Error'

      });

    }

    finally {

      client.release();

    }

};

module.exports = {

  addTransaction,
  getTransaction,
  editTransaction,
  removeTransaction

};
