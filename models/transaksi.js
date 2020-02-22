module.exports = (parent, child) => {
    return child.define('transaksi', {
        id: {
            type: parent.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        no_hp: { type: parent.STRING, allowNull: false },
        provider_id: { type: parent.INTEGER, allowNull: false },
        pengirim: { type: parent.STRING, allowNull: false },
        created_at: { type: parent.DATE, allowNull: false },
    }, {
        freezeTableName: true,
        paranoid: false,
        timestamps: false
    });
};