from sqlalchemy.orm import declarative_base
Base = declarative_base()

import app.modules.users.models
import app.modules.categories.models
import app.modules.posts.models
