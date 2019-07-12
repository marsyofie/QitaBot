module.exports = (parent, child) => {
    return child.define('transaksi', {
        id: {
            type: parent.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        no_hp: { type: parent.STRING, allowNull: false },
        provider_duta: { type: parent.INTEGER },
        provider_ipay: { type: parent.INTEGER },
        provider_payfazz: { type: parent.INTEGER, allowNull: false },
        provider_portal: { type: parent.INTEGER },
        provider_andro: { type: parent.INTEGER },
        provider_bukalapak: { type: parent.INTEGER },
        provider_topindo: { type: parent.INTEGER, allowNull: false },
        provider_xmltronik: { type: parent.INTEGER, allowNull: false },
        provider_tmr: { type: parent.INTEGER },
        pengirim: { type: parent.STRING, },
        created_at: { type: parent.DATE, allowNull: false },
    }, {
        freezeTableName: true,
        paranoid: false,
        timestamps: false
    });
};