UPDATE public.profiles                                                                                                                                                                           
  SET account_type = 'admin'                                                                                                                                                                       
  WHERE user_id = (                                                                                                                                                                                
    SELECT id FROM auth.users WHERE email = 'fer@test.com'                                                                                                                                       
  );        