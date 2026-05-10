GRANT EXECUTE ON FUNCTION public.is_trip_owner(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trip_is_public(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_activity_owner(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activity_is_public(uuid) TO anon, authenticated;