import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();

import db from '../models/index.js';

const { User, Notification } = db;



// ======================
// [1] 유저 등록 API
// ======================

router.post('/users/register', async (req, res) => {

    try {

        const {
            studentId,
            name,
            department,
            password,
            preferredRole,
            skills,
            introduction
        } = req.body;

        // 필수값 체크
        if (!studentId || !name || !department || !password) {
            return res.status(400).json({
                success: false,
                message: '필수 정보 누락'
            });
        }

        // 중복 체크
        const existingUser = await User.findByPk(studentId);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '이미 존재하는 학번입니다.'
            });
        }

        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 유저 생성
        const newUser = await User.create({
            studentId,
            name,
            department,
            password: hashedPassword,
            preferredRole,
            skills,
            introduction
        });

        return res.status(201).json({
            success: true,
            message: '회원 등록 성공',
            data: newUser
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: '서버 오류',
            error: error.message
        });

    }

});



// ======================
// [2] 신청하기 → 알림 생성
// ======================

router.post('/notifications/apply', async (req, res) => {

    try {

        const {
            senderId,
            senderName,
            receiverId,
            teamTitle
        } = req.body;

        if (!senderId || !receiverId || !teamTitle) {

            return res.status(400).json({
                success: false,
                message: '알림 정보 누락'
            });

        }

        // 받는 사람 존재 여부 확인
        const receiver = await User.findByPk(receiverId);

        if (!receiver) {

            return res.status(404).json({
                success: false,
                message: '받는 사용자가 존재하지 않습니다.'
            });

        }

        // 메시지 생성
        const message =
            `[${teamTitle}] 팀에 ${senderName}(${senderId}) 님이 신청했습니다.`;

        // 알림 저장
        const notification = await Notification.create({

            senderId,
            receiverId,
            teamTitle,
            type: 'apply',
            message

        });

        return res.status(201).json({

            success: true,
            message: '신청 및 알림 전송 완료',
            data: notification

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

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



export default router;