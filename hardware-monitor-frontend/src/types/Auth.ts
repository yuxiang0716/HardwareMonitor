// src/types/Auth.ts

import * as yup from 'yup';

// 確保 UserRole 類型與後端一致，並在前端使用字串
export type UserRole = 'Admin' | 'CompanyStaff' | 'User';

// 註冊請求 DTO
export interface RegisterRequest {
    account: string;
    password: string;
    confirmPassword: string; // 前端專用，不傳給後端
    role: UserRole;
    companyName?: string;
}

// 登入請求 DTO
export interface LoginRequest {
  account: string;
  password: string;
}

// 登入回應 DTO (與後端 LoginResponseDto 對應)
export interface LoginResponse {
    token: string;
    account: string;
    role: 'Admin' | 'CompanyStaff' | 'User';
    companyName?: string;
}

// Yup 驗證 Schema
export const loginSchema = yup.object().shape({
  account: yup.string().required('帳號為必填欄位'),
  password: yup.string().required('密碼為必填欄位'),
});

// 註冊請求 DTO
export interface RegisterRequest {
    account: string;
    password: string;
    role: 'Admin' | 'CompanyStaff' | 'User';
    companyName?: string;
}

// 註冊驗證 Schema
export const registerSchema = yup.object().shape({
    account: yup.string().required('帳號為必填欄位'),
    password: yup.string().required('密碼為必填欄位'),
    confirmPassword: yup.string()
        .required('請確認密碼')
        .oneOf([yup.ref('password')], '兩次輸入的密碼不一致'),
    
    // 角色選擇
    role: yup.mixed<UserRole>() // 使用 mixed<T> 來處理字串列舉
        .oneOf(['Admin', 'CompanyStaff', 'User'], '角色選擇無效')
        .required('請選擇角色'),

    // 條件式驗證：如果角色是 'CompanyStaff'，則 companyName 為必填
    companyName: yup.string().when('role', {
        is: 'CompanyStaff',
        then: (schema) => schema.required('選擇公司內部人員時，公司名稱為必填'),
        otherwise: (schema) => schema.nullable().notRequired(), // 其他角色不需此欄位
    }),
});