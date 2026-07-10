import QueryBuilder from "../../utils/queryBuilder";

export const createTier = async (
  Model: any,
  payload: any
) => {
  const tier = new Model(payload);
  return tier.save();
};

export const updateTier = async (
  Model: any,
  id: string,
  payload: any
) => {
  return Model.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const getTier = async (
  Model: any,
  adminId?: string
) => {
  const query: any = {};

  if (adminId) {
    query.admin = adminId;
  }

  return Model.find(query).sort({
    pointsThreshold: 1,
  });
};

export const getSingleTier = async (
  Model: any,
  id: string
) => {
  return Model.findById(id);
};

export const deleteTier = async (
  Model: any,
  id: string
) => {
  return Model.findByIdAndDelete(id);
};

export const getAllTiers = async (
  Model: any,
  query: Record<string, any>,
  adminId?: string
) => {
  const queryBuilder = new QueryBuilder(
    Model.find(),
    {
      ...query,
      ...(adminId && { admin: adminId }),
    }
  );

  queryBuilder
    .search(["name", "description"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await queryBuilder.modelQuery;
  const pagination = await queryBuilder.getPaginationInfo();

  return {
    data,
    pagination,
  };
};