import { UserSlim } from "./user";

export interface LiveRoom {
  id: string;
  roomNumber: number;
  streamerId: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  status: 0 | 1 | 2; // 0:未开始 1:直播中 2:已结束
  createdAt: string;
  updatedAt: string;
}

export interface LiveRoomWithStreamer extends LiveRoom {
  streamer: UserSlim;
  _count: { followers: number; auctions: number };
  isFollowed?: boolean;
}

export interface LiveRoomDetail extends LiveRoom {
  streamer: UserSlim;
  followers?: LiveRoomFollow[];
  auctions?: any[];
}

export interface LiveRoomFollow {
  id: string;
  userId: string;
  liveRoomId: string;
  createdAt: string;
}

export interface LiveRoomFollowWithDetails extends LiveRoomFollow {
  user: UserSlim;
  liveRoom: LiveRoom;
}

export type LiveRoomStatus = 0 | 1 | 2; // 0:未开始 1:直播中 2:已结束

export interface CreateLiveRoomParams {
  title: string;
  description?: string;
  coverImage?: string;
}

export interface UpdateLiveRoomParams {
  title?: string;
  description?: string;
  coverImage?: string;
  status?: LiveRoomStatus;
}

export interface FollowLiveRoomParams {
  liveRoomId: string;
}
