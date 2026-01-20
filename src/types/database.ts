export interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  school: string | null;
  student_id: string | null;
  friend_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  teacher: string | null;
  classroom: string | null;
  day_of_week: number;
  start_period: number;
  end_period: number;
  color: CourseColor;
  created_at: string;
  updated_at: string;
}

export type CourseColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'cyan';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface FriendWithProfile {
  id: string;
  friend_id: string;
  profile: Profile;
}

export interface FriendRequestWithProfile {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  created_at: string;
  from_profile?: Profile;
}
