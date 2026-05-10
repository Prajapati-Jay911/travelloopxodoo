export const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  photo: true,
  phone: true,
  city: true,
  country: true,
  bio: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const communityUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  photo: true,
  city: true,
  country: true,
} as const;

