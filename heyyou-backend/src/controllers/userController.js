
const supabase = require('../supabase/client');
const getDistance = require('../utils/distance');

exports.registerUser = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;
    if (!name || latitude == null || longitude == null) {
      return res.status(400).json({ error: 'Missing name or coordinates' });
    }

    const { data: existing, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('name', name)
      .maybeSingle();
    if (selectError) throw selectError;

    if (existing) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ latitude, longitude, online: true, last_online: new Date() })
        .eq('id', existing.id);
      if (updateError) throw updateError;
      return res.json({ id: existing.id });
    }

    const { data, error: insertError } = await supabase
      .from('users')
      .insert([{ name, latitude, longitude, online: true, last_online: new Date() }])
      .select();

    if (insertError) throw insertError;
    res.json({ id: data[0].id });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNearbyUsers = async (req, res) => {
  const { latitude, longitude } = req.query;
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('online', true);

  if (error) return res.status(500).json({ error: error.message });

  const result = users
    .map(user => ({
      ...user,
      distance: getDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        user.latitude,
        user.longitude
      )
    }))
    .filter(u => u.distance <= 1000)
    .sort((a, b) => a.distance - b.distance);

  res.json(result);
};
