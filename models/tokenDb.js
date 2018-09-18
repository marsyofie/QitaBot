module.exports = (parent, child) => {
    return child.define('token', {
        id: {
            type: parent.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'id'
        },
        id_server: { type: parent.STRING, allowNull: true },
        nama_server: { type: parent.STRING, allowNull: true },
        token: { type: parent.STRING, allowNull: true },
        updated_at: { type: parent.DATE, allowNull: true },
    }, {
        freezeTableName: true,
        paranoid: false,
        timestamps: false
    });
};