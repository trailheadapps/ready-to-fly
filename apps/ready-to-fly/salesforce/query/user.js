'use strict';

const fetchLoggedInUserManagerHirerachy = async (connection) => {
    try {
        //Get the UserId
        const currentuser = await connection.identity();
        // Query for Managers up to 2 levels
        const result = await connection.query(
            `SELECT Manager.Name, ManagerId, Manager.Manager.Name, Manager.ManagerId FROM User WHERE Id = \'${currentuser.user_id}\'`
        );
        return result;
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = { fetchLoggedInUserManagerHirerachy };
