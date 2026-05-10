REVOKE EXECUTE ON FUNCTION public.is_trip_owner(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trip_is_public(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_activity_owner(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.activity_is_public(uuid) FROM PUBLIC, anon, authenticated;