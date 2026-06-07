import express from 'express';
import Sequelize from 'sequelize';

const router = express.Router();

import db from '../models/index.js';
const { User, Notification, Application } = db;



// ======================
// [2] 신청하기 → 알림 생성
// ======================

router.post('/notifications/apply', async (req, res) => {
    try {
        const { senderId, senderName, receiverId, teamTitle, postId } = req.body;

        if (!senderId || !receiverId || !teamTitle || !postId) {
            return res.status(400).json({ success: false, message: '알림 정보 누락' });
        }

        // 받는 사람 존재 여부 확인 (studentId 또는 UUID id 모두 허용)
        const receiver = await User.findOne({
            where: {
                [Sequelize.Op.or]: [{ studentId: receiverId }, { id: receiverId }],
            },
        });

        if (!receiver) {
            return res.status(404).json({ success: false, message: '받는 사용자가 존재하지 않습니다.' });
        }

        // 발신자(신청자) 정보 확인 및 일관된 ID 확보
        const senderUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [{ studentId: senderId }, { id: senderId }],
            },
        });
        const resolvedSenderId = senderUser ? senderUser.studentId || senderUser.id : senderId;
        const resolvedReceiverId = receiver.studentId || receiver.id;

        // 중복 신청 체크
        const existingApply = await Application.findOne({ where: { postId, applicantId: resolvedSenderId } });
        if (existingApply) {
            return res.status(400).json({ success: false, message: '이미 신청한 프로젝트입니다.' });
        }

        // 신청 레코드 저장
        const application = await Application.create({ postId, applicantId: resolvedSenderId });

        // 알림 생성
        const message = `[${teamTitle}] 팀에 ${senderName}(${resolvedSenderId}) 님이 신청했습니다.`;
        const notification = await Notification.create({
            senderId: resolvedSenderId,
            receiverId: resolvedReceiverId,
            teamTitle,
            type: 'apply',
            message,
        });

        // 신청자(본인)에게도 알림 저장
        const senderMessage = `[${teamTitle}] 팀에 신청을 완료했습니다.`;
        await Notification.create({
            senderId: resolvedReceiverId,
            receiverId: resolvedSenderId,
            teamTitle,
            type: 'apply',
            message: senderMessage,
        });

        return res.status(201).json({ success: true, message: '신청 및 알림 전송 완료', data: notification });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message });
    }
});



// ======================
// [3] 특정 유저 알림 조회
// ======================

router.get('/notifications/:userId', async (req, res) => {

    try {

        const { userId } = req.params;

        const notifications = await Notification.findAll({

            where: {
                receiverId: userId
            },

            order: [['createdAt', 'DESC']]

        });

        return res.status(200).json({

            success: true,
            data: notifications

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            error: error.message

        });

    }

});



// ======================
// [4] 알림 읽음 처리
// ======================

router.patch('/notifications/:id/read', async (req, res) => {

    try {

        const notification =
            await Notification.findByPk(req.params.id);

        if (!notification) {

            return res.status(404).json({
                success: false,
                message: '알림이 존재하지 않습니다.'
            });

        }

        notification.isRead = true;

        await notification.save();

        return res.status(200).json({

            success: true,
            message: '읽음 처리 완료'

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            error: error.message

        });

    }

});



// ======================
// [5] 알림 삭제
// ======================

router.delete('/notifications/:id', async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: '알림이 존재하지 않습니다.'
            });
        }
        await notification.destroy();
        return res.status(200).json({
            success: true,
            message: '알림 삭제 완료'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;