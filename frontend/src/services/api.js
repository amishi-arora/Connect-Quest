import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://kaitlynnchan-service1.prod1b.defang.dev/api/';

export const createUser = async (user) => {
    try {
        const response = await axios.post(`${API_URL}/user/create`, user);
        return response.data;
    } catch (error){
        throw new Error(error.response?.data?.error || "Failed to create user");
    }
}

export const fetchChallenges = async () => {
    try {
      const response = await axios.get(`${API_URL}/challenges`);
      console.log(response);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch challenges");
    }
};

export const fetchChallenge = async () => {
  try {
    const response = await axios.get(`${API_URL}/challenge`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch challenge");
  }
};