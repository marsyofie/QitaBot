module.exports = (parent, child) => {
    return child.define('master_harga', {
        id: {
            type: parent.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'id'
        },
        kode: { type: parent.STRING, allowNull: true },
        harga: { type: parent.STRING, allowNull: true },
        provider_id: { type: parent.STRING, allowNull: true },
        penyedia_id: { type: parent.STRING, allowNull: true },
        kode_translate: { type: parent.STRING, allowNull: true },
        updated_at: { type: parent.DATE, allowNull: true },
        created_at: { type: parent.DATE, allowNull: true },
    }, {
        freezeTableName: true,
        paranoid: false,
        timestamps: false
    });
};