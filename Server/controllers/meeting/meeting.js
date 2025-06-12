require('../../model/schema/user');
require('../../model/schema/lead');
require('../../model/schema/contact');
const MeetingHistory = require('../../model/schema/meeting');
const mongoose = require('mongoose');

const add = async (req, res) => {
    try {
        const {
            agenda,
            attendes,
            attendesLead,
            location,
            related,
            dateTime,
            notes,
            createBy,
        } = req.body;

        // validate agenda required
        if (!agenda) {
            return res.status(400).json({ error: 'Missing agenda value.' });
        }

        // validate createBy required
        if (!createBy || !mongoose.Types.ObjectId.isValid(createBy)) {
            return res
                .status(400)
                .json({ error: 'Invalid or missing createBy value.' });
        }

        // validate attendes id's
        if (
            attendes &&
            (!Array.isArray(attendes) ||
                attendes.some((id) => !mongoose.Types.ObjectId.isValid(id)))
        ) {
            return res
                .status(400)
                .json({ error: 'Invalid attendes value(s).' });
        }

        // validate attendesLead id's
        if (
            attendesLead &&
            (!Array.isArray(attendesLead) ||
                attendesLead.some((id) => !mongoose.Types.ObjectId.isValid(id)))
        ) {
            return res
                .status(400)
                .json({ error: 'Invalid attendes lead value(s).' });
        }

        const newMeetingHistoryData = {
            agenda,
            attendes,
            attendesLead,
            location,
            related,
            dateTime,
            notes,
            createBy,
            timestamp: new Date(),
            deleted: false,
        };

        const result = new MeetingHistory(newMeetingHistoryData);
        await result.save();
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to create meeting:', err);
        res.status(400).json({ error: 'Failed to create meeting : ', err });
    }
};

const index = async (req, res) => {
    const {
        createBy,
        agenda,
        dateTimeFrom,
        dateTimeTo,
        timestampFrom,
        timestampTo,
        ...restQuery
    } = req.query;

    const matchFilter = {
        deleted: false,
        ...restQuery,
    };

    // date filtering
    if (dateTimeFrom || dateTimeTo) {
        matchFilter.dateTime = {};
        if (dateTimeFrom) matchFilter.dateTime.$gte = new Date(dateTimeFrom);
        if (dateTimeTo) matchFilter.dateTime.$lte = new Date(dateTimeTo);
    }

    if (timestampFrom || timestampTo) {
        matchFilter.timestamp = {};
        if (timestampFrom) matchFilter.timestamp.$gte = new Date(timestampFrom);
        if (timestampTo) matchFilter.timestamp.$lte = new Date(timestampTo);
    }

    try {
        const result = await MeetingHistory.aggregate([
            { $match: matchFilter },

            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

            ...(createBy
                ? [
                      {
                          $match: {
                              'user.username': {
                                  $regex: createBy,
                                  $options: 'i',
                              },
                          },
                      },
                  ]
                : []),

            ...(agenda?.trim()
                ? [
                      {
                          $match: {
                              agenda: { $regex: agenda.trim(), $options: 'i' },
                          },
                      },
                  ]
                : []),

            {
                $addFields: {
                    createByEmail: '$user.username',
                },
            },

            {
                $project: {
                    user: 0,
                },
            },
        ]);

        res.send(result);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).send('Internal Server Error');
    }
};

const view = async (req, res) => {
    try {
        const response = await MeetingHistory.findOne({ _id: req.params.id })
            .populate('createBy')
            .populate('attendes')
            .populate('attendesLead')
            .lean();

        if (!response) {
            return res.status(404).json({ message: 'No Data Found.' });
        }

        res.status(200).json(response);
    } catch (err) {
        console.log('Error:', err);
        res.status(400).json({ Error: err });
    }
};

const deleteData = async (req, res) => {
    try {
        const result = await MeetingHistory.findOneAndUpdate(
            { _id: req.params.id, deleted: false },
            { deleted: true },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: 'Meeting not found.' });
        }

        res.status(200).json({ message: 'Meeting deleted.', result });
    } catch (err) {
        res.status(404).json({ message: 'Error deleting meeting.', err });
    }
};

const deleteMany = async (req, res) => {
    try {
        const meetingIds = req.body;

        // validate all meeting ids
        const invalidIds = meetingIds.filter(
            (id) => !mongoose.Types.ObjectId.isValid(id)
        );
        if (invalidIds.length > 0) {
            return res
                .status(400)
                .json({ error: 'One or more invalid meeting IDs', invalidIds });
        }

        // find existing meeting ids
        const existingMeetings = await MeetingHistory.find({
            _id: { $in: meetingIds },
        });
        const existingIds = existingMeetings.map((m) => m._id.toString());

        // find missing ids
        const missingIds = meetingIds.filter((id) => !existingIds.includes(id));
        if (missingIds.length > 0) {
            return res
                .status(404)
                .json({ error: 'Some meeting IDs not found', missingIds });
        }

        // all provided meeting ids are valid and exist — proceed with deletion
        await MeetingHistory.updateMany(
            { _id: { $in: meetingIds } },
            { $set: { deleted: true } }
        );

        res.status(200).json({ message: 'Meetings deleted successfully' });
    } catch (err) {
        return res.status(404).json({ success: false, message: 'error', err });
    }
};

module.exports = { add, index, view, deleteData, deleteMany };
